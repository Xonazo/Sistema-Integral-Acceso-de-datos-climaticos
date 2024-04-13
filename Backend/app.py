import io
import xarray as xr

import matplotlib
matplotlib.use('Agg')  # Configuración del backend no interactivo
import matplotlib.pyplot as plt
import cartopy.crs as ccrs
import numpy as np
import base64
from flask import Flask, request, jsonify, after_this_request
from flask_cors import CORS  

app = Flask(__name__)
CORS(app)  

# Ruta para recibir el archivo NetCDF y generar los mapas
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'netcdfFile' not in request.files:
        return 'No se ha proporcionado ningún archivo NetCDF'

    netcdf_file = request.files['netcdfFile']
    netcdf_data = netcdf_file.read()

    # Cargar el archivo NetCDF
    data = xr.open_dataset(io.BytesIO(netcdf_data))

    # Obtener todas las variables del archivo excepto 'time', 'lat' y 'lon'
    variables = [var for var in data.variables if var not in ['time', 'lat', 'lon']]

    # Lista para almacenar los mapas generados
    images = []

    # Iterar sobre cada variable y generar un mapa para cada una
    for variable_seleccionada in variables:
        # Seleccionar un plano específico de la variable seleccionada (por ejemplo, el primer tiempo)
        variable_data = data[variable_seleccionada].isel(time=0).values  # Extraer los valores de la variable

        # Verificar si la forma de los datos es al menos (2, 2)
        if variable_data.shape < (2, 2):
            print(f"Los datos de la variable {variable_seleccionada} no tienen una forma adecuada.")
            continue

        # Obtener las coordenadas de latitud y longitud
        lat = data['lat']
        lon = data['lon']

        # Crear una figura y ejes con proyección cartográfica
        fig = plt.figure(figsize=(12, 8))  # Ajustar tamaño de la figura
        ax = plt.axes(projection=ccrs.PlateCarree())

        # Obtener los valores mínimos y máximos para normalizar el mapa de colores
        vmin = np.min(variable_data)
        vmax = np.max(variable_data)

        # Graficar los datos en el mapa, intercambiando latitud y longitud
        plt.contourf(lon, lat, variable_data.T, transform=ccrs.PlateCarree(), cmap='coolwarm', vmin=vmin, vmax=vmax)

        # Agregar detalles al mapa
        ax.coastlines()
        ax.gridlines(draw_labels=True)

        # Añadir título y etiquetas
        plt.title(f'Mapa de la variable {variable_seleccionada}' , loc='center', pad=20)
        plt.xlabel('Longitud')
        plt.ylabel('Latitud')

        # Guardar la figura en un buffer de bytes
        buffer = io.BytesIO()
        cb = plt.colorbar(label='Unidades de la variable', orientation='horizontal', shrink=0.5)  # Colorbar horizontal, shrink=0.5 para hacerla más pequeña
        cb.ax.tick_params(labelsize=10)  # Ajustar tamaño de las etiquetas del colorbar
        plt.subplots_adjust(bottom=0.15)  # Ajustar espacio debajo del gráfico
        plt.savefig(buffer, format='png')
        buffer.seek(0)  # Reiniciar el cursor al principio del buffer

        # Convertir la imagen PNG a Base64
        encoded_image = base64.b64encode(buffer.read()).decode('utf-8')
        images.append(encoded_image)

        # Limpiar la figura para liberar recursos
        plt.close()

    # Utilizamos after_this_request para asegurarnos de que la limpieza se realice después de enviar la respuesta
    @after_this_request
    def cleanup(response):
        matplotlib.pyplot.close('all')  # Cerrar todas las figuras
        return response

    # Devolver las imágenes en Base64 al frontend
    return jsonify(images)









if __name__ == '__main__':
    app.run(debug=True)


