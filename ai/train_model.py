
"""
KRISHI-NET AI ENGINE - PRODUCTION TRAINING SCRIPT
Phase 3 Implementation: EfficientNet Training Pipeline

This script implements:
1. Data Augmentation (Albumentations)
2. Class Balancing (Focal Loss)
3. Transfer Learning (EfficientNetB4)
4. Metrics & Callbacks
5. Model Serialization
"""

import tensorflow as tf
from tensorflow.keras import layers, models, optimizers, callbacks
from tensorflow.keras.applications import EfficientNetB4
import numpy as np
import os
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.utils import class_weight

# Configuration
IMG_SIZE = 380  # EfficientNetB4 optimal size
BATCH_SIZE = 32
EPOCHS = 50
LEARNING_RATE = 1e-4
NUM_CLASSES = 38  # Example: 38 classes from PlantVillage + Indian Crops
DATA_DIR = './dataset/krishi_net_v1'

def build_augmenter():
    """Phase 3: Robust Data Augmentation"""
    return tf.keras.Sequential([
        layers.RandomFlip("horizontal_and_vertical"),
        layers.RandomRotation(0.2),
        layers.RandomContrast(0.2),
        layers.RandomBrightness(0.2),
        layers.RandomZoom(0.2),
        layers.GaussianNoise(0.1)
    ])

def build_model(num_classes):
    """Phase 2: Model Architecture using Transfer Learning"""
    inputs = layers.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
    
    # Augmentation Layer
    x = build_augmenter()(inputs)
    
    # Base Model (Pre-trained on ImageNet)
    base_model = EfficientNetB4(include_top=False, input_tensor=x, weights="imagenet")
    base_model.trainable = False # Freeze first
    
    x = layers.GlobalAveragePooling2D()(base_model.output)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3)(x)
    
    # Severity & Disease Head
    x = layers.Dense(1024, activation='swish')(x) # Swish is better for EfficientNet
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(num_classes, activation='softmax', name='disease_output')(x)
    
    model = models.Model(inputs, outputs)
    return model, base_model

def get_focal_loss(gamma=2., alpha=4.):
    """Phase 3: Focal Loss for Class Imbalance"""
    def focal_loss_fixed(y_true, y_pred):
        epsilon = 1.e-9
        y_true = tf.convert_to_tensor(y_true, tf.float32)
        y_pred = tf.convert_to_tensor(y_pred, tf.float32)
        
        model_out = tf.add(y_pred, epsilon)
        ce = tf.multiply(y_true, -tf.math.log(model_out))
        weight = tf.multiply(y_true, tf.pow(tf.subtract(1., model_out), gamma))
        fl = tf.multiply(alpha, tf.multiply(weight, ce))
        reduced_fl = tf.reduce_max(fl, axis=1)
        return tf.reduce_mean(reduced_fl)
    return focal_loss_fixed

def train_pipeline():
    print("Initializing Krishi-Net Training Pipeline...")
    
    # 1. Load Data
    train_ds = tf.keras.utils.image_dataset_from_directory(
        os.path.join(DATA_DIR, 'train'),
        image_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        shuffle=True
    )
    
    val_ds = tf.keras.utils.image_dataset_from_directory(
        os.path.join(DATA_DIR, 'val'),
        image_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE
    )

    # 2. Performance Optimization
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.cache().prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

    # 3. Build Model
    model, base_model = build_model(NUM_CLASSES)
    
    # 4. Compile
    model.compile(
        optimizer=optimizers.Adam(learning_rate=LEARNING_RATE),
        loss='categorical_crossentropy', # Or get_focal_loss() for extreme imbalance
        metrics=['accuracy', tf.keras.metrics.Precision(), tf.keras.metrics.Recall()]
    )

    # 5. Callbacks (Phase 3)
    checkpoint_cb = callbacks.ModelCheckpoint(
        "krishi_net_best_model.h5", save_best_only=True, monitor='val_accuracy'
    )
    early_stopping_cb = callbacks.EarlyStopping(
        patience=10, restore_best_weights=True, monitor='val_loss'
    )
    reduce_lr_cb = callbacks.ReduceLROnPlateau(
        factor=0.2, patience=5, min_lr=1e-6
    )

    # 6. Training
    print("Starting Phase 1 Training (Frozen Base)...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS,
        callbacks=[checkpoint_cb, early_stopping_cb, reduce_lr_cb]
    )
    
    # 7. Fine Tuning
    print("Unfreezing base model for Fine Tuning...")
    base_model.trainable = True
    
    # Freeze Batch Normalization layers to keep stats stable
    for layer in base_model.layers:
        if isinstance(layer, layers.BatchNormalization):
            layer.trainable = False

    model.compile(
        optimizer=optimizers.Adam(learning_rate=1e-5), # Very low LR
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    history_fine = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=20,
        callbacks=[checkpoint_cb, early_stopping_cb, reduce_lr_cb]
    )
    
    # 8. Export (Phase 9)
    print("Exporting to SavedModel format for production...")
    model.save('krishi_net_prod_v1')
    
    # Convert to TFLite for Edge Deployment (Optional)
    converter = tf.lite.TFLiteConverter.from_saved_model('krishi_net_prod_v1')
    converter.optimizations = [tf.lite.Optimize.DEFAULT] # Quantization
    tflite_model = converter.convert()
    
    with open('krishi_net_quantized.tflite', 'wb') as f:
        f.write(tflite_model)
        
    print("Training Complete. Model saved.")

if __name__ == '__main__':
    # Ensure GPU is available
    print("Num GPUs Available: ", len(tf.config.list_physical_devices('GPU')))
    train_pipeline()
