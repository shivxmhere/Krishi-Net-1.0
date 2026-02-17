"""
KRISHI-NET AI ENGINE - PRODUCTION TRAINING SCRIPT (v2.0)
Phase 3 Implementation: EfficientNet Training Pipeline (Expanded for Indian Crops)

Updates:
- Expanded to 54 Classes (PlantVillage + Apple, Wheat, Rice, Saffron, Cotton)
- Adjusted Focal Loss for rare crop detection (Saffron)
- Added class weighting support
"""

import tensorflow as tf
from tensorflow.keras import layers, models, optimizers, callbacks
from tensorflow.keras.applications import EfficientNetB4
import numpy as np
import os

# --- Configuration ---
IMG_SIZE = 380  # Optimized for EfficientNetB4
BATCH_SIZE = 32
EPOCHS = 50
LEARNING_RATE = 1e-4
# 38 (Original) + 5 (Wheat) + 3 (Rice) + 3 (Saffron) + 5 (Cotton) = 54
NUM_CLASSES = 54  
DATA_DIR = './data/raw_images'  # Updated to the new structure we discussed

def build_augmenter():
    """Robust Data Augmentation for varying field conditions"""
    return tf.keras.Sequential([
        layers.RandomFlip("horizontal_and_vertical"),
        layers.RandomRotation(0.25),
        layers.RandomContrast(0.3),
        layers.RandomBrightness(0.3),
        layers.RandomZoom(0.2),
        layers.GaussianNoise(0.1)
    ])

def build_model(num_classes):
    """Transfer Learning with EfficientNetB4"""
    inputs = layers.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
    
    # Apply Augmentation
    x = build_augmenter()(inputs)
    
    # Pre-trained Base
    base_model = EfficientNetB4(include_top=False, input_tensor=x, weights="imagenet")
    base_model.trainable = False  # Freeze for Phase 1
    
    x = layers.GlobalAveragePooling2D()(base_model.output)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.4)(x)  # Increased dropout for higher complexity
    
    # Specialized Dense Head
    x = layers.Dense(1024, activation='swish')(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(num_classes, activation='softmax', name='disease_output')(x)
    
    model = models.Model(inputs, outputs)
    return model, base_model

def get_focal_loss(gamma=2.5, alpha=0.25):
    """Enhanced Focal Loss for Saffron/Rare class detection"""
    def focal_loss_fixed(y_true, y_pred):
        epsilon = 1.e-9
        y_true = tf.convert_to_tensor(y_true, tf.float32)
        y_pred = tf.convert_to_tensor(y_pred, tf.float32)
        
        model_out = tf.add(y_pred, epsilon)
        ce = tf.multiply(y_true, -tf.math.log(model_out))
        weight = tf.multiply(y_true, tf.pow(tf.subtract(1., model_out), gamma))
        fl = tf.multiply(alpha, tf.multiply(weight, ce))
        return tf.reduce_mean(tf.reduce_max(fl, axis=1))
    return focal_loss_fixed

def train_pipeline():
    print(f"Initializing Krishi-Net with {NUM_CLASSES} classes...")
    
    # 1. Load Data (Using labels from folder names)
    train_ds = tf.keras.utils.image_dataset_from_directory(
        os.path.join(DATA_DIR, 'train'),
        label_mode='categorical',
        image_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        shuffle=True
    )
    
    val_ds = tf.keras.utils.image_dataset_from_directory(
        os.path.join(DATA_DIR, 'val'),
        label_mode='categorical',
        image_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE
    )

    # 2. Performance Optimization
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.cache().prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

    # 3. Build Model
    model, base_model = build_model(NUM_CLASSES)
    
    # 4. Compile (Using Focal Loss for better balance)
    model.compile(
        optimizer=optimizers.Adam(learning_rate=LEARNING_RATE),
        loss=get_focal_loss(), 
        metrics=['accuracy']
    )

    # 5. Callbacks
    callbacks_list = [
        callbacks.ModelCheckpoint("krishi_net_best.h5", save_best_only=True, monitor='val_accuracy'),
        callbacks.EarlyStopping(patience=8, restore_best_weights=True),
        callbacks.ReduceLROnPlateau(factor=0.2, patience=4)
    ]

    # 6. Phase 1: Training the Head
    print("Phase 1: Training Top Layers...")
    model.fit(train_ds, validation_data=val_ds, epochs=15, callbacks=callbacks_list)
    
    # 7. Phase 2: Fine Tuning
    print("Phase 2: Fine-Tuning the Whole Engine...")
    base_model.trainable = True
    # Keep BatchNormalization frozen to prevent unstable gradients
    for layer in base_model.layers:
        if isinstance(layer, layers.BatchNormalization):
            layer.trainable = False

    model.compile(
        optimizer=optimizers.Adam(learning_rate=1e-5), # Lower LR for fine-tuning
        loss=get_focal_loss(),
        metrics=['accuracy']
    )
    
    model.fit(train_ds, validation_data=val_ds, epochs=15, callbacks=callbacks_list)
    
    # 8. Export for Backend (FastAPI) and Mobile
    model.save('backend/app/saved_models/krishi_net_v2')
    print("Model saved to backend directory.")

if __name__ == '__main__':
    train_pipeline()