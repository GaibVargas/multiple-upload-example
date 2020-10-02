import React, { useEffect, useState } from 'react';
import { uniqueId } from 'lodash';
import filesize from 'filesize';

import api from './services/api';

import Upload from './components/Upload';
import FileList from './components/FileList';

import GlobalStyle from './styles/global';
import { Container, Content } from './styles';

function App() {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  function handleUpload(files) {
    const handleUploadedFiles = files.map(file => ({
      file,
      id: uniqueId(),
      name: file.name,
      readableSize: filesize(file.size),
      preview: URL.createObjectURL(file),
      progress: 0,
      uploaded: false,
      error: false,
      url: null,
    }));

    setUploadedFiles((previous) => [...previous, ...handleUploadedFiles]);
    handleUploadedFiles.forEach(processUploaded);
  }

  function updateFile(id, data) {
    setUploadedFiles((previous) => {
      return previous.map(file => {
        return file.id ===id ? { ...file, ...data }: file;
      })
    });
  }

  async function handleDelete(id) {
    await api.delete(`/posts/${id}`);

    setUploadedFiles((previous) => {
      return previous.filter(file => file.id !== id);
    });
  }

  function processUploaded(uploadedFile) {
    const data = new FormData();

    data.append('file', uploadedFile.file, uploadedFile.name);

    api.post('/posts', data, {
      onUploadProgress: e => {
        const progress = parseInt(Math.round((e.loaded * 100)/ e.total));

        updateFile(uploadedFile.id, { progress });
      }
    }).then((response) => {
      updateFile(uploadedFile.id, {
        uploaded: true,
        id: response.data._id,
        url: response.data.url
      })
    }).catch(() => {
      updateFile(uploadedFile.id, {
        error: true,
      })
    });
  }

  useEffect(() => {
    async function loadPreviousData() {
      const response = await api.get('posts');

      setUploadedFiles(response.data.map(file => ({
        id: file._id,
        name: file.name,
        readableSize: filesize(file.size),
        preview: file.url,
        uploaded: true,
        url: file.url,
      })));
    }

    loadPreviousData();

    return () => {
      uploadedFiles.forEach(file => URL.revokeObjectURL(file.preview));
    }
  }, []);

  return (
    <Container>
      <Content>
        <Upload onUpload={handleUpload} />

        {!!uploadedFiles.length && <FileList files={uploadedFiles} onDelete={handleDelete} />}
      </Content>

      <GlobalStyle />
    </Container>
  );
}

export default App;
