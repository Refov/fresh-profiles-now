<?php
header('Content-Type: application/json');

// CORS for form posting if needed
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: content-type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

// Lightweight diagnostics (safe): check if required env vars are present
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['ping'])) {
  $hasUrl = (bool) (getenv('SUPABASE_URL') ?: getenv('REFOV_SUPABASE_URL'));
  $hasKey = (bool) (getenv('SUPABASE_SERVICE_ROLE_KEY') ?: getenv('REFOV_SUPABASE_SERVICE_ROLE_KEY'));
  // Try fallback include without exposing values
  if (!$hasUrl || !$hasKey) {
    $fallback = __DIR__ . '/_secrets.php';
    if (file_exists($fallback)) {
      include $fallback;
      $hasUrl = $hasUrl ?: (bool) (getenv('SUPABASE_URL') ?: getenv('REFOV_SUPABASE_URL'));
      $hasKey = $hasKey ?: (bool) (getenv('SUPABASE_SERVICE_ROLE_KEY') ?: getenv('REFOV_SUPABASE_SERVICE_ROLE_KEY'));
    }
  }
  echo json_encode(['ok' => true, 'has_supabase_url' => $hasUrl, 'has_service_key' => $hasKey]);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

$profileId = isset($data['profileId']) ? trim($data['profileId']) : '';
$recruiterEmail = isset($data['recruiterEmail']) ? trim($data['recruiterEmail']) : '';
$message = isset($data['message']) ? trim($data['message']) : '';
$turnstileToken = isset($data['turnstileToken']) ? $data['turnstileToken'] : '';

if (!$profileId || !$recruiterEmail || !filter_var($recruiterEmail, FILTER_VALIDATE_EMAIL) || strlen($message) < 10) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid input']);
  exit;
}

// Optional Turnstile check
$turnstileSecret = getenv('TURNSTILE_SECRET_KEY');
if ($turnstileSecret) {
  $verifyPayload = json_encode([
    'secret' => $turnstileSecret,
    'response' => $turnstileToken,
  ]);
  $ch = curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
  curl_setopt($ch, CURLOPT_POSTFIELDS, $verifyPayload);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  $verifyRes = curl_exec($ch);
  $verifyHttp = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  $verifyJson = @json_decode($verifyRes, true);
  if ($verifyHttp !== 200 || !$verifyJson || empty($verifyJson['success'])) {
    http_response_code(400);
    echo json_encode(['error' => 'CAPTCHA verification failed']);
    exit;
  }
}

// Fetch candidate email from Supabase REST
$supabaseUrl = getenv('SUPABASE_URL') ?: (getenv('REFOV_SUPABASE_URL') ?: getenv('SB_URL'));
$serviceKey = getenv('SUPABASE_SERVICE_ROLE_KEY') ?: (getenv('REFOV_SUPABASE_SERVICE_ROLE_KEY') ?: (getenv('SUPABASE_SERV') ?: (getenv('SR_KEY') ?: getenv('SUPA_SR_KEY'))));
// Local secrets fallback: drop a server-only file at public/api/_secrets.php with putenv calls
if (!$supabaseUrl || !$serviceKey) {
  $fallback = __DIR__ . '/_secrets.php';
  if (file_exists($fallback)) {
    include $fallback; // should call putenv(...)
    $supabaseUrl = $supabaseUrl ?: (getenv('SUPABASE_URL') ?: getenv('REFOV_SUPABASE_URL'));
    $serviceKey = $serviceKey ?: (getenv('SUPABASE_SERVICE_ROLE_KEY') ?: getenv('REFOV_SUPABASE_SERVICE_ROLE_KEY'));
  }
}
if (!$supabaseUrl || !$serviceKey) {
  http_response_code(500);
  echo json_encode(['error' => 'Server not configured: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY']);
  exit;
}

$endpoint = rtrim($supabaseUrl, '/') . '/rest/v1/profiles?select=email&id=eq.' . rawurlencode($profileId) . '&limit=1';
$ch = curl_init($endpoint);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'apikey: ' . $serviceKey,
  'Authorization: Bearer ' . $serviceKey,
  'Accept: application/json',
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$resp = curl_exec($ch);
$http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http !== 200) {
  http_response_code(502);
  echo json_encode(['error' => 'Profile lookup failed']);
  exit;
}

$arr = @json_decode($resp, true);
if (!is_array($arr) || count($arr) === 0 || empty($arr[0]['email'])) {
  http_response_code(404);
  echo json_encode(['error' => 'Candidate not found']);
  exit;
}

$candidateEmail = $arr[0]['email'];

// Send email using PHP mail()
$from = 'Refov <no-reply@refov.com>';
$headers = [];
$headers[] = 'From: ' . $from;
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
if ($recruiterEmail) {
  $headers[] = 'Reply-To: ' . $recruiterEmail;
}

$subject = 'New message from a recruiter via Refov';
$body = "From: $recruiterEmail\n\n$message";

$ok = @mail($candidateEmail, '=?UTF-8?B?'.base64_encode($subject).'?=', $body, implode("\r\n", $headers));
if (!$ok) {
  http_response_code(500);
  echo json_encode(['error' => 'Mail send failed']);
  exit;
}

echo json_encode(['success' => true]);
exit;
?>


