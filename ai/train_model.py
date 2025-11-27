import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

DATA_PATH = "data/hayq_prices.csv"
MODEL_DIR = "saved_model"
MODEL_PATH = os.path.join(MODEL_DIR, "hayq_model.pkl")

class Trainer:
    def __init__(self, data_path=DATA_PATH):
        self.data_path = data_path
        self.model = None

    def load_data(self):
        data = pd.read_csv(self.data_path)
        X = data.drop("target_price", axis=1)
        y = data["target_price"]
        return train_test_split(X, y, test_size=0.2, random_state=42)

    def train_model(self):
        X_train, X_test, y_train, y_test = self.load_data()
        self.model = RandomForestRegressor(n_estimators=200, random_state=42)
        self.model.fit(X_train, y_train)
        return self.model

    def save_model(self, model_path=MODEL_PATH):
        if not os.path.exists(MODEL_DIR):
            os.makedirs(MODEL_DIR)
        joblib.dump(self.model, model_path)
        print(f"✅ Model trained and saved at {model_path}!")

def main():
    trainer = Trainer()
    trainer.train_model()
    trainer.save_model()

if __name__ == "__main__":
    main()
