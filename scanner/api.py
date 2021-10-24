import cv2
import numpy
from flask import Flask, request
from pyzxing import BarCodeReader

app = Flask(__name__)

reader = BarCodeReader()

@app.route('/scan', methods=['POST'])
def analyse():
    if 'file' not in request.files:
        if 'file' in request.form:
            app.logger.info('"file" field set in form instead of files')
            return '"file" field set in form instead of files', 400
        else:
            app.logger.info('"file" field is not set')
            return '"file" field is not set', 400
    nparr = numpy.frombuffer(request.files['file'].stream.read(), numpy.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    result = reader.decode_array(frame)
    return {
        'codes': list(map(lambda x: x['parsed'].decode('UTF-8'), result))
    }


if __name__ == '__main__':
    app.run('0.0.0.0', 80, debug=True)
    app.logger.info("Ready!")
