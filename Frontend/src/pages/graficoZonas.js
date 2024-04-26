import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';


export default function UploadPage() {
    const [file, setFile] = useState(null);
    const [images, setImages] = useState([]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };

    const handleSubmit = async () => {
        // Verificar si se seleccionó un archivo
        if (!file) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'No se ha seleccionado ningún archivo'
            });
            return;
        }

        // Verificar si el archivo seleccionado es un archivo NetCDF
        if (!file.name.endsWith('.nc')) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Este no es un archivo NetCDF'
            });
            return;
        }

        const formData = new FormData();
        formData.append('netcdfFile', file);

        const loadingAlert = Swal.fire({
            title: 'Cargando...',
            allowOutsideClick: false,
            showConfirmButton: false,

            onBeforeOpen: () => {
                Swal.showLoading();
            }
        });


        try {
            const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                console.log('Imágenes recibidas:', response.data);
                setImages(response.data);
                loadingAlert.close();
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Archivo descargado exitosamente ",
                    showConfirmButton: false,
                    timer: 1500
                });

            } else {
                console.error('Error al cargar el archivo');
            }
        } catch (error) {
            console.error('Error al enviar la solicitud:', error);

            if (error.response && error.response.data && error.response.data.error === "El archivo no tiene la forma adecuada") {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'El archivo no tiene la forma adecuada'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Error al cargar el archivo'
                });
            }


        }
    };

    return (
        <div class="flex flex-col justify-start items-center  p-2 space-y-4">
            <h1 className='font-bold text-2xl'>Cargar archivo NetCDF</h1>
            <input type="file" onChange={handleFileChange} />
            <button type="button" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleSubmit} disabled={!file}>Cargar</button>

            <div>
                {Array.isArray(images) && images.length > 0 ? (
                    images.map((imageData, index) => (
                        <img key={index} src={`data:image/png;base64,${imageData}`} alt={`Imagen ${index}`} />
                    ))
                ) : (
                    <p>No se han recibido imágenes</p>
                )}
            </div>
        </div>
    );
}
