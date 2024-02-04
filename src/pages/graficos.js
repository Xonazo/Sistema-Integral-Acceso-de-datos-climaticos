import React, { useState } from 'react';
import { NetCDFReader } from 'netcdfjs';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
export default function Graficos() {
    const [file, setFile] = useState(null);
    const [variables, setVariables] = useState([]);
    const [selectedVariable, setSelectedVariable] = useState(null);
    const [data, setData] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [shouldRenderChart, setShouldRenderChart] = useState(false);
    const [variableLongNames, setVariableLongNames] = useState({});
    const [startTime, setStartTime] = useState();




    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);

        // Parsear el archivo NetCDF cuando se seleccione un archivo
        parseNetCDF(selectedFile);
    };

    const parseNetCDF = (file) => {
        const reader = new FileReader();
        reader.onload = () => {
            const arrayBuffer = reader.result;
            const data = new Uint8Array(arrayBuffer);
            const ncReader = new NetCDFReader(data);

            // Almacenar los nombres de las variables disponibles
            const variableNames = ncReader.variables.map(variable => variable.name);
            setVariables(variableNames);

            const timeVariable = ncReader.variables.find(variable => variable.name === 'time');

            if (timeVariable) {
                const startTimeAttribute = timeVariable.attributes.find(attr => attr.name === 'units');

                if (startTimeAttribute) {
                    const startTimeString = startTimeAttribute.value;
                    const startTime = new Date(startTimeString.split('since ')[1]);
                    setStartTime(startTime);
                    console.log('Tiempo de inicio:', startTime);
                } else {
                    console.log('No se encontró el atributo units para la variable de tiempo');
                }
            } else {
                console.log('No se encontró la variable de tiempo');
            }










            const titulos = ncReader.variables.map(variable => variable);
            console.log(titulos)




            const longNames = {};
            ncReader.variables.forEach(variable => {
                const longNameAttribute = variable.attributes.find(attr => attr.name === 'long_name');
                if (longNameAttribute) {
                    // Eliminar los guiones bajos de los nombres largos y almacenarlos
                    longNames[variable.name] = longNameAttribute.value.replace(/_/g, ' ');
                } else {
                    longNames[variable.name] = variable.name;
                }
            });
            setVariableLongNames(longNames);


            // Seleccionar automáticamente la primera variable
            if (variableNames.length > 0) {
                setSelectedVariable(variableNames[0]);
            }

            // Almacena el objeto NetCDFReader en el estado
            setData(ncReader);



        };
        reader.readAsArrayBuffer(file);
    };

    const generateChartData = () => {
        if (data && selectedVariable) {
            const variableData = data.getDataVariable(selectedVariable);

            // Filtrar los valores de -999
            const filteredData = variableData.filter(value => value !== -999);

            const labels = filteredData.map((value, index) => index);
            const values = filteredData.map(value => value);
            const chartData = {
                labels: labels,
                datasets: [
                    {
                        label: variableLongNames[selectedVariable],
                        data: values,
                        fill: false,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }
                ]
            };
            setChartData(chartData);
            setShouldRenderChart(true);
        }
    };


    // Generar el gráfico cuando se selecciona una variable
    React.useEffect(() => {
        generateChartData();
    }, [selectedVariable]);

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            {file && <p>Archivo seleccionado: {file.name}</p>}

            {/* Mostrar las variables disponibles */}
            <p>Variables disponibles:</p>
            <select value={selectedVariable} onChange={(e) => setSelectedVariable(e.target.value)}>
                {variables.map((variable, index) => (
                    <option key={index} value={variable}>{variableLongNames[variable]}</option>
                ))}
            </select>

            {/* Mostrar el gráfico si se debe renderizar */}
            {shouldRenderChart && chartData && (
                <div className='w-1/2'>
                    <Line

                        data={chartData}
                        options={{
                            scales: {
                                x: { type: 'linear' },
                                y: { type: 'linear' }
                            }
                        }}
                    />
                </div>
            )}
        </div>
    );
}
