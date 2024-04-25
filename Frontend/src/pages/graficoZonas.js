import React, { useState } from 'react';
import axios from 'axios';

export default function UploadPage() {
    const [file, setFile] = useState(null);
    const [images, setImages] = useState([]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append('netcdfFile', file);

        try {
            const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                // Aquí puedes manejar la respuesta del servidor
                console.log('Imágenes recibidas:', response.data);
                setImages(response.data); // Establecer las imágenes recibidas en el estado
            } else {
                console.error('Error al cargar el archivo');
            }
        } catch (error) {
            console.error('Error al enviar la solicitud:', error);
        }
    };

    return (
        <div>
            <h1>Cargar archivo NetCDF</h1>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleSubmit} disabled={!file}>
                Cargar
            </button>

            {/* Mostrar las imágenes recibidas */}
            <div>
                {images.map((imageData, index) => (
                    <img key={index} src={`data:image/png;base64,${imageData}`} alt={`Imagen ${index}`} />
                ))}
            </div>
        </div>
    );
}
