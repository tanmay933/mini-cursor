const API = 'http://localhost:5001';

export async function fetchFileTree(root: string) {
  const res = await fetch(API + '/api/files?root=' + encodeURIComponent(root));
  return res.json();
}

export async function fetchFileContent(root: string, filePath: string) {
  const res = await fetch(API + '/api/files/content?root=' + encodeURIComponent(root) + '&file=' + encodeURIComponent(filePath));
  return res.json();
}

export async function saveFile(root: string, filePath: string, content: string) {
  await fetch(API + '/api/files?root=' + encodeURIComponent(root) + '&file=' + encodeURIComponent(filePath), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
}

export async function createFile(root: string, type: 'file' | 'directory', relativePath: string, content?: string) {
  await fetch(API + '/api/files?root=' + encodeURIComponent(root), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, path: relativePath, content }),
  });
}

export async function deleteFile(root: string, filePath: string) {
  await fetch(API + '/api/files?root=' + encodeURIComponent(root) + '&file=' + encodeURIComponent(filePath), {
    method: 'DELETE',
  });
}
