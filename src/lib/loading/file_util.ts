export interface ReadFile {
  name: string;
  extension: string;
  type: string;
  data: ArrayBuffer;
}

export function getFileExtension(file: File) {
  // Case where file has no extension.
  if (!file.name.includes('.')) {
    return '';
  }

  return file.name.split('.').at(-1)!;
}

export async function readFileAsArrayBuffer(file: File): Promise<ReadFile> {
  const data = await file.arrayBuffer();

  return {
    name: file.name,
    extension: getFileExtension(file),
    type: file.type,
    data,
  };
}

export async function readFolder() {
  return new Promise<File[]>(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.setAttribute('webkitdirectory', '');
    input.setAttribute('directory', '');
    input.setAttribute('multiple', '');

    const handleInput = async () => {
      if (!input.files) {
        resolve([]);
        return;
      }

      const files = Array.from(input.files);
      resolve(files);
    };

    input.addEventListener('change', handleInput, { once: true });
    input.click();
  });
}
