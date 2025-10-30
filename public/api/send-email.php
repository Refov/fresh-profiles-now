<?php
header('Content-Type: application/json');

// Allow only POST
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Headers: authorization, content-type');
  header('Access-Control-Allow-Methods: POST, OPTIONS');
  http_response_code(204);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

// Simple Bearer secret check
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$parts = explode(' ', $authHeader);
$provided = isset($parts[0], $parts[1]) && strtolower($parts[0]) === 'bearer' ? $parts[1] : '';

// Read secret from env if available, else from placeholder string
$expected = getenv('MAIL_WEBHOOK_SECRET') ?: 'sadfjf@@$9asf;askf($(@';

if (!$provided || !$expected || !hash_equals($expected, $provided)) {
  http_response_code(403);
  echo json_encode(['error' => 'Forbidden']);
  exit;
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$to = isset($data['to']) ? trim($data['to']) : '';
$subject = isset($data['subject']) ? trim($data['subject']) : '';
$text = isset($data['text']) ? $data['text'] : '';
$replyTo = isset($data['reply_to']) ? trim($data['reply_to']) : '';

if (!$to || !filter_var($to, FILTER_VALIDATE_EMAIL) || !$subject || !$text) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid input']);
  exit;
}

$from = 'Refov <no-reply@refov.com>';

$headers = [];
$headers[] = 'From: ' . $from;
if ($replyTo && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
  $headers[] = 'Reply-To: ' . $replyTo;
}
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';

$success = @mail($to, '=?UTF-8?B?'.base64_encode($subject).'?=', $text, implode("\r\n", $headers));

if (!$success) {
  http_response_code(500);
  echo json_encode(['error' => 'Mail send failed']);
  exit;
}

echo json_encode(['success' => true]);
exit;
?>


