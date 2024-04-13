import React, { useState, useEffect } from 'react';
import { NetCDFReader } from 'netcdfjs';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import Swal from 'sweetalert2';

export default function Graficos() {
    const [file1, setFile1] = useState(null);
    const [file2, setFile2] = useState(null);
    const [variables1, setVariables1] = useState([]);
    const [variables2, setVariables2] = useState([]);
    const [selectedVariable1, setSelectedVariable1] = useState(null);
    const [selectedVariable2, setSelectedVariable2] = useState(null);
    const [data1, setData1] = useState(null);
    const [data2, setData2] = useState(null);
    const [chartData1, setChartData1] = useState(null);
    const [chartData2, setChartData2] = useState(null);
    const [shouldRenderChart1, setShouldRenderChart1] = useState(false);
    const [shouldRenderChart2, setShouldRenderChart2] = useState(false);
    const [variableLongNames1, setVariableLongNames1] = useState({});
    const [variableLongNames2, setVariableLongNames2] = useState({});
    const [startTime1, setStartTime1] = useState();
    const [startTime2, setStartTime2] = useState();


    useEffect(() => {
        if (variables1.length > 0) {
            setSelectedVariable1(variables1[0]);
        }
    }, [variables1]);

    useEffect(() => {
        if (variables2.length > 0) {
            setSelectedVariable2(variables2[0]);
        }
    }, [variables2]);


    const handleFileChange1 = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.name.endsWith('.nc')) {
            setFile1(selectedFile);
            parseNetCDF(selectedFile, setData1, setVariables1, setVariableLongNames1, setStartTime1);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Este no es un archivo NetCDF'
            });
        }
    };

    const handleFileChange2 = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.name.endsWith('.nc')) {
            setFile2(selectedFile);
            parseNetCDF(selectedFile, setData2, setVariables2, setVariableLongNames2, setStartTime2);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Este no es un archivo NetCDF'
            });
        }
    };

    const parseNetCDF = (file, setData, setVariables, setVariableLongNames, setStartTime) => {
        const reader = new FileReader();
        reader.onload = () => {
            const arrayBuffer = reader.result;
            const data = new Uint8Array(arrayBuffer);
            const ncReader = new NetCDFReader(data);

            const variableNames = ncReader.variables.map(variable => variable.name);
            setVariables(variableNames);


            const longNames = {};
            ncReader.variables.forEach(variable => {
                const longNameAttribute = variable.attributes.find(attr => attr.name === 'long_name');
                if (longNameAttribute) {
                    longNames[variable.name] = longNameAttribute.value.replace(/_/g, ' ');
                } else {
                    longNames[variable.name] = variable.name;
                }
            });
            setVariableLongNames(longNames);

            setData(ncReader);
        };
        reader.readAsArrayBuffer(file);
    };

    const generateChartData = (data, selectedVariable, setChartData, setShouldRenderChart) => {
        if (data && selectedVariable) {
            const variableData = data.getDataVariable(selectedVariable);
            const filteredData = variableData.filter(value => value !== -999);

            const labels = filteredData.map((value, index) => index);
            const values = filteredData.map(value => value);
            const chartData = {
                labels: labels,
                datasets: [
                    {
                        label: selectedVariable,
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

    React.useEffect(() => {
        generateChartData(data1, selectedVariable1, setChartData1, setShouldRenderChart1);
    }, [selectedVariable1, data1]);

    React.useEffect(() => {
        generateChartData(data2, selectedVariable2, setChartData2, setShouldRenderChart2);
    }, [selectedVariable2, data2]);

    return (
        <div className="grid grid-cols-2 gap-8 justify-center bg-blue-100 ">
            <div className="m-4 ">
                <div className='flex flex-col items-center '>
                    <input type="file" onChange={handleFileChange1} className="mb-2" />
                    {file1 && <p className="mb-2 text-sm">Archivo seleccionado: {file1.name}</p>}
                    <p className="mb-2">Variables disponibles:</p>
                    <select value={selectedVariable1} onChange={(e) => setSelectedVariable1(e.target.value)} className="mb-4">
                        <option disabled hidden className="">Selecciona Variable</option>
                        {variables1
                            .filter(variable => !['time', 'lat', 'lon'].includes(variable))
                            .map((variable, index) => (
                                <option key={index} value={variable}>{variableLongNames1[variable]}</option>
                            ))}
                    </select>
                </div>
                {shouldRenderChart1 && chartData1 && (
                    <div className="w-full bg-white">
                        <Line
                            data={chartData1}
                            options={{
                                maintainAspectRatio: true,
                                scales: {
                                    x: { type: 'linear' },
                                    y: { type: 'linear' }
                                }
                            }}
                        />
                    </div>
                )}
            </div>
            <div className="m-4">
                <div className='flex flex-col items-center'>
                    <input type="file" onChange={handleFileChange2} className="mb-2" />
                    {file2 && <p className="mb-2 text-sm ">Archivo seleccionado: {file2.name}</p>}
                    <p className="mb-2 ">Variables disponibles:</p>
                    <select value={selectedVariable2} onChange={(e) => setSelectedVariable2(e.target.value)} className="mb-4">
                        <option value="" disabled hidden>Selecciona Variable </option>
                        {variables2
                            .filter(variable => !['time', 'lat', 'lon'].includes(variable))
                            .map((variable, index) => (
                                <option key={index} value={variable}>{variableLongNames2[variable]}</option>
                            ))}
                    </select>
                </div>
                {shouldRenderChart2 && chartData2 && (
                    <div className="w-full bg-white">
                        <Line
                            data={chartData2}
                            options={{
                                maintainAspectRatio: true,
                                scales: {
                                    x: { type: 'linear' },
                                    y: { type: 'linear' }
                                }
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );





}
