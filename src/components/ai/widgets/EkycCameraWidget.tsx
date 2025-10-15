import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
} from "react-native";
import { Camera, CameraType } from "expo-camera";
// Hoặc sử dụng react-native-vision-camera nếu bạn muốn
// import { Camera, useCameraDevices } from 'react-native-vision-camera';

const { width } = Dimensions.get("window");

interface EkycCameraWidgetProps {
  onDone: (data: { selfie: string }) => void;
  onCancel?: () => void;
}

export default function EkycCameraWidget({
  onDone,
  onCancel,
}: EkycCameraWidgetProps) {
  const cameraRef = useRef < Camera > null;
  const [countdown, setCountdown] = useState(3);
  const [captured, setCaptured] = useState(false);
  const [image, setImage] = (useState < string) | (null > null);
  const [hasPermission, setHasPermission] =
    (useState < boolean) | (null > null);
  const [cameraType, setCameraType] = useState(CameraType.front);

  // Request camera permission
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // Countdown and auto capture
  useEffect(() => {
    if (captured || !hasPermission) return;

    if (countdown === 0) {
      takePicture();
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, captured, hasPermission]);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
          skipProcessing: false,
        });

        const imageUri = `data:image/jpeg;base64,${photo.base64}`;
        setImage(imageUri);
        setCaptured(true);

        setTimeout(() => {
          if (onDone) {
            onDone({ selfie: imageUri });
          }
        }, 500);
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại.");
      }
    }
  };

  const handleRetake = () => {
    setCaptured(false);
    setImage(null);
    setCountdown(3);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Đang yêu cầu quyền truy cập camera...
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorMessage}>
          Không có quyền truy cập camera. Vui lòng cấp quyền trong Settings.
        </Text>
        {onCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Đóng</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <Modal visible={true} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Xác thực khuôn mặt</Text>
          {onCancel && (
            <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.cameraContainer}>
          {!captured ? (
            <Camera
              ref={cameraRef}
              style={styles.camera}
              type={cameraType}
              ratio="1:1"
            >
              <View style={styles.overlay}>
                <View style={styles.faceFrame} />
                {countdown > 0 && (
                  <View style={styles.countdownContainer}>
                    <Text style={styles.countdownText}>{countdown}</Text>
                  </View>
                )}
              </View>
            </Camera>
          ) : (
            image && (
              <Image source={{ uri: image }} style={styles.capturedImage} />
            )
          )}
        </View>

        <View style={styles.instructionsContainer}>
          {!captured ? (
            <>
              <Text style={styles.instructions}>
                Vui lòng nhìn vào camera để xác thực khuôn mặt
              </Text>
              <Text style={styles.subInstructions}>
                Hệ thống sẽ tự động chụp ảnh sau {countdown} giây...
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.successMessage}>
                ✅ Đã chụp ảnh xác thực thành công!
              </Text>
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={handleRetake}
              >
                <Text style={styles.retakeButtonText}>Chụp lại</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {!captured && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.manualCaptureButton}
              onPress={takePicture}
            >
              <Text style={styles.manualCaptureButtonText}>Chụp ngay</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.flipButton}
              onPress={() =>
                setCameraType(
                  cameraType === CameraType.back
                    ? CameraType.front
                    : CameraType.back
                )
              }
            >
              <Text style={styles.flipButtonText}>🔄</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#6b7280",
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  faceFrame: {
    width: width * 0.6,
    height: width * 0.6,
    borderWidth: 3,
    borderColor: "#10b981",
    borderRadius: (width * 0.6) / 2,
    backgroundColor: "transparent",
  },
  countdownContainer: {
    position: "absolute",
    bottom: 50,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  countdownText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  capturedImage: {
    flex: 1,
    width: "100%",
    resizeMode: "cover",
  },
  instructionsContainer: {
    padding: 20,
    alignItems: "center",
  },
  instructions: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    textAlign: "center",
    marginBottom: 8,
  },
  subInstructions: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  successMessage: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10b981",
    textAlign: "center",
    marginBottom: 16,
  },
  retakeButton: {
    backgroundColor: "#6b7280",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retakeButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  manualCaptureButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  manualCaptureButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  flipButton: {
    backgroundColor: "#f3f4f6",
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  flipButtonText: {
    fontSize: 20,
  },
  message: {
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
    margin: 20,
  },
  errorMessage: {
    fontSize: 16,
    color: "#dc2626",
    textAlign: "center",
    margin: 20,
  },
  cancelButton: {
    backgroundColor: "#6b7280",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 16,
  },
  cancelButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
});
