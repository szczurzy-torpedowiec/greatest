from flask import Flask, request
from PIL import Image
from pyzbar import pyzbar

app = Flask(__name__)


@app.route('/scan', methods=['POST'])
def analyse():
    if 'file' not in request.files:
        if 'file' in request.form:
            app.logger.info('"file" field set in form instead of files')
            return '"file" field set in form instead of files', 400
        else:
            app.logger.info('"file" field is not set')
            return '"file" field is not set', 400
    image = Image.open(request.files['file'])
    return {
        'codes': list(map(lambda x: x.data.decode('UTF-8'), pyzbar.decode(image)))
    }


if __name__ == '__main__':
    app.run('0.0.0.0', 80, debug=True)
    app.logger.info("Ready!")
