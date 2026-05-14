export async function manualIssuePass({ accessToken, guestId, productKey }) {
  const response = await fetch('/.netlify/functions/manual-issue-pass', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ guestId, productKey }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || 'Could not manually issue pass.');
  }

  return payload;
}
