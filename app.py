import os
import ydf
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

MODEL_PATH = "nest_prediction_model"
model = ydf.from_tensorflow_decision_forests(MODEL_PATH)

FEATURE_NAMES = [
    "elevation", "beach_width", "max_beach_slope", "avg_beach_slope",
    "dune_height", "max_dune_slope", "average_dune_slope", "distance_from_shoreline"
]

FEATURE_DISP = {
    "elevation": "Elevation (meters above sea level)",
    "beach_width": "Beach Width (meters)",
    "max_beach_slope": "Maximum Beach Slope",
    "avg_beach_slope": "Average Beach Slope",
    "dune_height": "Maximum Dune Height (meters)",
    "max_dune_slope": "Maximum Dune Slope",
    "average_dune_slope": "Average Dune Slope",
    "distance_from_shoreline": "Distance from Shoreline (meters)"
}

FEATURE_MEANS = {
    "elevation": 3.2,
    "beach_width": 18.9,
    "max_beach_slope": 7.3,
    "avg_beach_slope": 3.3,
    "dune_height": 114.4,
    "max_dune_slope": 34.0,
    "average_dune_slope": 8.4,
    "distance_from_shoreline": 93.9
}

FEATURE_STDEVS = {
    "elevation": 1.9,
    "beach_width": 11.3,
    "max_beach_slope": 4.2,
    "avg_beach_slope": 1.2,
    "dune_height": 822.8,
    "max_dune_slope": 9.0,
    "average_dune_slope": 2.6,
    "distance_from_shoreline": 71.7
}


@app.route('/')
def index():
    return render_template('index.html', feature_names=FEATURE_NAMES, feature_disp=FEATURE_DISP)
    
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        input_data = {feature: [((float(data[feature]) - FEATURE_MEANS[feature]) / FEATURE_STDEVS[feature])] for feature in FEATURE_NAMES}

        prediction = model.predict(input_data)

        return jsonify({
            'status': 'success',
            'prediction': prediction.tolist()
        })

    except KeyError as e:
        return jsonify({'error': f'Missing parameter: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)