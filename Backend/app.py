import io
import xarray as xr

import matplotlib
matplotlib.use('Agg') 
import matplotlib.pyplot as plt
import cartopy.crs as ccrs
import numpy as np
import base64
from flask import Flask, request, jsonify, after_this_request
from flask_cors import CORS  

app = Flask(__name__)

CORS(app, resources={r"/upload": {"origins": "http://localhost:3000"}})

# Ruta 
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'netcdfFile' not in request.files:
        return 'No se ha proporcionado ningún archivo NetCDF'

    netcdf_file = request.files['netcdfFile']
    netcdf_data = netcdf_file.read()


    data = xr.open_dataset(io.BytesIO(netcdf_data))

    variables = [var for var in data.variables if var not in ['time', 'lat', 'lon']]

  
    images = []


    for variable_seleccionada in variables:
        variable_data = data[variable_seleccionada].isel(time=0).values  

   
        if variable_data.shape < (2, 2):

            print(f"Los datos de la variable {variable_seleccionada} no tienen una forma adecuada.")
            return jsonify({'error': 'El archivo no tiene la forma adecuada'}), 422
            #continue

        lat = data['lat']
        lon = data['lon']

        fig = plt.figure(figsize=(12, 8))  
        ax = plt.axes(projection=ccrs.PlateCarree())

        vmin = np.min(variable_data)
        vmax = np.max(variable_data)

        plt.contourf(lon, lat, variable_data.T, transform=ccrs.PlateCarree(), cmap='coolwarm', vmin=vmin, vmax=vmax)

        ax.coastlines()
        ax.gridlines(draw_labels=True)

        plt.title(f'Mapa de la variable {variable_seleccionada}' , loc='center', pad=20)
        plt.xlabel('Longitud')
        plt.ylabel('Latitud')

        buffer = io.BytesIO()
        cb = plt.colorbar(label='Unidades de la variable', orientation='horizontal', shrink=0.5)  
        cb.ax.tick_params(labelsize=10)  
        plt.subplots_adjust(bottom=0.15)  
        plt.savefig(buffer, format='png')
        buffer.seek(0) 

        encoded_image = base64.b64encode(buffer.read()).decode('utf-8')
        images.append(encoded_image)

        plt.close()

    @after_this_request
    def cleanup(response):
        matplotlib.pyplot.close('all')  
        return response

    return jsonify(images)









if __name__ == '__main__':
    app.run(debug=True)


