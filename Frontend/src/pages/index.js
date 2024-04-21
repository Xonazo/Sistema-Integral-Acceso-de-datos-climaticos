import { useEffect, useState } from 'react';
import MapView from '@/components/MapView';
import axios from 'axios';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';


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

    setActivarBoton(true);

    const fechaInicioFormateada = formatearFecha(new Date(startDate));
    const fechaFinFormateada = formatearFecha(new Date(endDate));
    console.log(fechaInicioFormateada, "fecha inicio formateada")
    console.log(fechaFinFormateada, "fecha fin formateada")
    console.log(latitude, "latitud2")
    console.log(longitude, "longitud2")
    console.log(parameters, "parametros2")
    console.log(comunidad, "comunidad2")
    console.log(formato, "formato2")


    const loadingAlert = Swal.fire({
      title: 'Cargando...',
      allowOutsideClick: false,
      showConfirmButton: false,

      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });


    try {
      const response = await axios.get(`https://power.larc.nasa.gov/api/temporal/${intervalo}/point?start=${fechaInicioFormateada}&end=${fechaFinFormateada}&latitude=${latitude}&longitude=${longitude}&community=${comunidad}&parameters=${parameters}&format=${formato}&header=true&time-standard=lst`,
        { responseType: 'blob' }
      );
      //'https://power.larc.nasa.gov/api/temporal/daily/point?start=${startDate}&end=${endDate}&latitude=${latitude}&longitude=${longitude}&community=${comunidad}&parameters=${parameters}&format=${formato}&header=true&time-standard=lst'


      let extension = '.nc';

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

        default:
          break;
      }


      const contentDisposition = response.headers['content-disposition'];
      const fileNameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = fileNameRegex.exec(contentDisposition);
      const fileName = matches && matches[1] ? matches[1] : `archivo_descargado${extension}`;

      saveAs(response.data, fileName);
      setActivarBoton(false);

      loadingAlert.close();
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Archivo descargado exitosamente ",
        showConfirmButton: false,
        timer: 1500
      });


      console.log(response.data, "data")
    } catch (error) {
      setActivarBoton(false);


      loadingAlert.close();
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Algo salió mal!",
        footer: 'Revisa los datos ingresados'
      });
      console.log(error);
    }
  }



  const handleMapClick = (lat, lng) => {
    setLatitude(lat);
    //console.log(lat, "latitud")
    setLongitude(lng);
    //console.log(lng, "longitud")
  };

  const handleTabClick = (tab) => {
    console.log(tab, "tab1")
    setActiveTab(tab);
  };


  const [activeTab, setActiveTab] = useState('tab1');
  const [activarBoton, setActivarBoton] = useState(false);






  const [latitudInferiorIzquierda, setLatitudInferiorIzquierda] = useState(null);
  const [longitudInferiorIzquierda, setLongitudInferiorIzquierda] = useState(null);
  const [latitudSuperiorDerecha, setLatitudSuperiorDerecha] = useState(null);
  const [longitudSuperiorDerecha, setLongitudSuperiorDerecha] = useState(null);

  

  const cords = (lat1, lat2, lng1, lng2) => {
    setLatitudInferiorIzquierda(lat1);
    setLongitudInferiorIzquierda(lng1);
    setLatitudSuperiorDerecha(lat2);
    setLongitudSuperiorDerecha(lng2);
    
  };





  const formulario2 = () => {

    return (
      <form onSubmit={(e) => { e.preventDefault(); }}>
        <div>
          <h1 className="text-center text-2xl font-bold py-5">Zone</h1>
        </div>
        <div className="flex mb-4 gap-x-2">
          <label className='text-nowrap w-56 text-end'>Fecha de inicio</label>
          <input type="date" className="rounded-lg text-center w-full font-light" />
        </div>

        <div className="flex mb-4 gap-x-2">
          <label className='text-nowrap w-56 text-end'>Fecha de término</label>
          <input type="date"

            className="rounded-lg text-center w-full font-thin" />
        </div>

        <div className="flex mb-4 gap-x-2">
          <label className='text-nowrap w-56 text-end'>Latitud inferior izquierda:</label>
          <input type="text" placeholder="Ingresa latitud"
            onChange={(e) => setLatitudInferiorIzquierda(e.target.value)}
            value={latitudInferiorIzquierda}
            className="rounded-lg w-full text-center font-thin" />
        </div>

        <div className="flex mb-4 gap-x-2">
          <label className="text-nowrap w-56 text-end">Longitud inferior izquierda:</label>
          <input placeholder='Ingresa longitud' type="text"
            onChange={(e) => setLongitudInferiorIzquierda(e.target.value)}
            value={longitudInferiorIzquierda}
            className="rounded-lg text-center w-full font-thin" />
        </div>

        <div className="flex mb-4 gap-x-2">
          <label className='text-nowrap w-56 text-end'>Latitud superior derecha:</label>
          <input type="text" placeholder="Ingresa latitud"
            onChange={(e) => setLatitudSuperiorDerecha(e.target.value)}
            value={latitudSuperiorDerecha}
            className="rounded-lg w-full text-center font-thin" />
        </div>

        <div className="flex mb-4 gap-x-2">
          <label className="text-nowrap w-56 text-end">Longitud superior derecha:</label>
          <input placeholder='Ingresa longitud' type="text"
            onChange={(e) => setLongitudSuperiorDerecha(e.target.value)}
            value={longitudSuperiorDerecha}
            className="rounded-lg text-center w-full font-thin" />
        </div>


        <div className="flex mb-4 gap-x-2">
          <label className="text-nowrap w-56 text-end">Comunidad</label>
          <select className="rounded-lg text-center w-full font-thin"

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

          >
            <option value="" disabled selected hidden>Selecciona intervalo </option>
            <option value="hourly">Por Hora</option>
            <option value="daily">Diario</option>
          </select>
        </div>

        <div className="flex mb-4 gap-x-2">
          <label className="text-nowrap w-56 text-end">Parámetros</label>
          <select className="rounded-lg text-center w-full"

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
          >
            <option value="" disabled selected hidden>Selecciona formato</option>
            <option value="ascii">ASCII</option>
            <option value="csv">CSV</option>
            <option value="json">GeoJSON</option>
            <option value="netcdf">NetCDF</option>
          </select>
        </div>

        <button className="bg-blue-500 block w-full text-white px-4 py-2 rounded">
          Enviar
        </button>
      </form>
    )
  }





  return (

    <>
      <div className='flex'>

        {/* Contenedor que tiene seccion pestañas y seccion de formulario  */}
        <div className='bg-blue-100 '>

          {/* Seccion de pestañas */}
          <div className='flex'>
            <button
              className=' flex-1 bg-gray-100 inline-block border-l border-t border-r rounded-t py-2 px-4 text-blue-dark font-semibold hover:bg-gray-200'
              onClick={() => handleTabClick('tab1')}
            >
              Single Point
            </button>
            <button
              className='flex-1 bg-gray-100 inline-block border-l border-t border-r rounded-t py-2 px-4 text-blue-dark font-semibold hover:bg-gray-200'
              onClick={() => handleTabClick('tab2')}
            >
              Zone
            </button>
          </div>
          {/* Seccion de formulario */}
          <div className=' flex items-center p-4 '>
            {// Formulario 1
              activeTab === 'tab1' ? (

                <form onSubmit={handleFormSubmit}>
                  <div>
                    <h1 className="text-center text-2xl font-bold py-5">Single Point</h1>
                  </div>
                  <div className="flex mb-4 gap-x-2" >
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
                  <button
                    type="submit" className="bg-blue-500 block w-full text-white px-4 py-2 rounded"
                    disabled={activarBoton}
                  >
                    Enviar
                  </button>
                </form>
              ) : (
                // Formulario Tab 2 
                formulario2()
              )}
          </div>
          <div class="flex justify-center items-center " >
            <a href="/graficos" class="text-blue-500 underline"> Graficar</a>
          </div>
        </div>


        <div className='w-full'>
          <MapView onMapClick={handleMapClick}  onRectangle={cords}/>
        </div>
      </div>


    </>


  );
}
