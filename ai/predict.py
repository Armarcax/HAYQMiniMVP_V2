import pandas as pd
import joblib
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "../saved_model/hayq_model.pkl")

class Predictor:
    def __init__(self, model_path=MODEL_PATH):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        self.model_path = model_path
        self.model = joblib.load(model_path)

    def predict(self, data):
        df = pd.DataFrame([data])
        return self.model.predict(df)[0]

# Կարճ հարմարություն CLI համար
def main():
    predictor = Predictor()
    example_data = {
        "volume": 12345,
        "transactions": 234,
        "growth_rate": 0.07
    }
    prediction = predictor.predict(example_data)
    print("📈 Predicted Price:", prediction)

# Export prediction instance հեշտ import-ի համար
predictor_instance = Predictor()

if __name__ == "__main__":
    main()
