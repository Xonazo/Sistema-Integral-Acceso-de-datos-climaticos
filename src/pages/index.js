import { useEffect, useState } from 'react';
import MapView from '@/components/MapView';
import axios from 'axios';
import { saveAs } from 'file-saver';


export default function Home() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [parameters, setParameters] = useState('');
  const [comunidad, setComunidad] = useState('');
  const [formato, setFormato] = useState('');
  const [intervalo, setIntervalo] = useState('');


  const handleFormSubmit = (event) => {
    event.preventDefault();

    console.log(startDate, "fecha inicio")
    console.log(endDate, "fecha termino")
    console.log(latitude, "latitud")
    console.log(longitude, "longitud")
    console.log(parameters, "parametros")
    console.log(comunidad, "comunidad")
    console.log(formato, "formato")
    console.log(intervalo, "intervalo")


    hourlyApi();
  };


  const formatearFecha = (fecha) => {
    const año = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    return `${año}${mes}${dia}`;
  };


  const hourlyApi = async () => {

    const fechaInicioFormateada = formatearFecha(new Date(startDate));
    const fechaFinFormateada = formatearFecha(new Date(endDate));
    console.log(fechaInicioFormateada, "fecha inicio formateada")
    console.log(fechaFinFormateada, "fecha fin formateada")
    console.log(latitude, "latitud2")
    console.log(longitude, "longitud2")
    console.log(parameters, "parametros2")
    console.log(comunidad, "comunidad2")
    console.log(formato, "formato2")


    try {

      const response = await axios.get(`https://power.larc.nasa.gov/api/temporal/${intervalo}/point?start=${fechaInicioFormateada}&end=${fechaFinFormateada}&latitude=${latitude}&longitude=${longitude}&community=${comunidad}&parameters=${parameters}&format=${formato}&header=true&time-standard=lst`,
        { responseType: 'blob' }
      );
      //'https://power.larc.nasa.gov/api/temporal/daily/point?start=${startDate}&end=${endDate}&latitude=${latitude}&longitude=${longitude}&community=${comunidad}&parameters=${parameters}&format=${formato}&header=true&time-standard=lst'

      // Obtén la extensión del archivo según el formato seleccionado
      let extension = '.nc'; // Valor predeterminado

      switch (formato) {
        case 'ascii':
          extension = '.txt';
          break;
        case 'csv':
          extension = '.csv';
          break;
        case 'json':
          extension = '.json';
          break;
        // Puedes agregar más casos según sea necesari

        default:
          break;
      }


      // Obtén el nombre del archivo de la respuesta o utiliza uno predeterminado
      const contentDisposition = response.headers['content-disposition'];
      const fileNameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = fileNameRegex.exec(contentDisposition);
      const fileName = matches && matches[1] ? matches[1] : `archivo_descargado${extension}`;

      // Guarda el archivo con la extensión correspondiente usando FileSaver.js
      saveAs(response.data, fileName);

      console.log(response.data, "data")
    } catch (error) {
      console.log(error);
    }
  }



  const handleMapClick = (lat, lng) => {
    setLatitude(lat);
    //console.log(lat, "latitud")
    setLongitude(lng);
    //console.log(lng, "longitud")
  };

  return (
    <div className='flex'>

      <div className='bg-blue-100 flex items-center p-4'>
        <form onSubmit={handleFormSubmit}>
          <div className="flex mb-4 gap-x-2">
            <label className='text-nowrap w-56 text-end'>Fecha de inicio</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-lg text-center w-full font-light" />
          </div>

          <div className="flex mb-4 gap-x-2">
            <label className='text-nowrap w-56 text-end'>Fecha de término</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg text-center w-full font-thin" />
          </div>

          <div className="flex mb-4 gap-x-2">
            <label className='text-nowrap w-56 text-end'>Latitud</label>
            <input type="text" placeholder="Ingresa latitud" value={latitude} onChange={(e) => setLatitude(e.target.value)}
              className="rounded-lg w-full text-center font-thin" />
          </div>

          <div className="flex mb-4 gap-x-2">
            <label className="text-nowrap w-56 text-end">Longitud</label>
            <input placeholder='Ingresa longitud' type="text" value={longitude} onChange={(e) => setLongitude(e.target.value)}
              className="rounded-lg text-center w-full font-thin" />
          </div>

          <div className="flex mb-4 gap-x-2">
            <label className="text-nowrap w-56 text-end">Comunidad</label>
            <select className="rounded-lg text-center w-full font-thin"
              onChange={(e) => setComunidad(e.target.value)}
            >
              <option value="" disabled selected hidden>Selecciona comunidad</option>
              <option value="ag">Agroclimatología</option>
              <option value="sb">Energía renovable</option>
              <option value="re">Edificios Sostenibles</option>
            </select>
          </div>
          <div className="flex mb-4 gap-x-2">
            <label className="text-nowrap w-56 text-end">Intervalo</label>
            <select className="rounded-lg text-center w-full font-thin"
              onChange={(e) => setIntervalo(e.target.value)}
            >
              <option value="" disabled selected hidden>Selecciona intervalo </option>
              <option value="hourly">Por Hora</option>
              <option value="daily">Diario</option>
              {/* <option value="monthly">Mensual y Anual</option>*/}
            </select>
          </div>

          <div className="flex mb-4 gap-x-2">
            <label className="text-nowrap w-56 text-end">Parámetros</label>
            <select className="rounded-lg text-center w-full"
              onChange={(e) => setParameters(e.target.value)}
            >
              <option value="" disabled selected hidden>Selecciona parametros</option>
              <option value="T2M,T2MDEW,TS,T2MWET">Temperatura</option>
              <option value="PRECTOT,QV2M,RH2M">Humedad/Precipitacion</option>
              <option value="PS,WD10M,WS10M,WS50M,WD50M">Viento/Presion</option>
            </select>
          </div>

          <div className="flex mb-4 gap-x-2">
            <label className="text-nowrap w-56 text-end">Formato</label>
            <select className="rounded-lg text-center w-full"
              onChange={(e) => setFormato(e.target.value)}
            >
              <option value="" disabled selected hidden>Selecciona formato</option>
              <option value="ascii">ASCII</option>
              <option value="csv">CSV</option>
              <option value="json">GeoJSON</option>
              <option value="netcdf">NetCDF</option>
            </select>

          </div>
          <button type="submit" className="bg-blue-500 block w-full text-white px-4 py-2 rounded">
            Enviar
          </button>
        </form>
      </div>

      <div className='w-full'>
        <MapView onMapClick={handleMapClick} />
      </div>

    </div>



  );
}
