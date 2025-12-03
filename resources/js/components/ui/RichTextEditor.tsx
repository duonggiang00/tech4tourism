import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';
import { useRef } from 'react';

interface Props {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
    height?: number;
}

export default function RichTextEditor({ value, onChange, placeholder, height = 300 }: Props) {
    const editorRef = useRef<any>(null);

    return (
        <Editor
            
            tinymceScriptSrc="/build/tinymce/tinymce.min.js"
            onInit={(evt, editor) => editorRef.current = editor}
            value={value}
            onEditorChange={(content) => onChange(content)}
            init={{
                license_key: 'gpl',
                height: height,
                menubar: false,
                plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | image | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                placeholder: placeholder,
                
                // Cấu hình upload ảnh (Paste hoặc Insert)
                images_upload_handler: (blobInfo, progress) => new Promise((resolve, reject) => {
                    const formData = new FormData();
                    formData.append('file', blobInfo.blob(), blobInfo.filename());

                    axios.post('/upload-image', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        onUploadProgress: (e) => {
                            if (e.total) {
                                progress((e.loaded / e.total) * 100);
                            }
                        }
                    })
                    .then((response) => {
                        if (response.data.location) {
                            resolve(response.data.location); // TinyMCE uses this URL
                        } else {
                            reject('Upload failed: No location returned');
                        }
                    })
                    .catch((error) => {
                        const message = error.response?.data?.message || error.message || 'Upload failed';
                        reject(message);
                    });
                })
       
            }}
        />
    );
}