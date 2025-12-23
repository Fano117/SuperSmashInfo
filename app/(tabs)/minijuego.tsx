import { StyleSheet, View, Text } from 'react-native';

export default function MinijuegoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minijuego Robo de Puntos</Text>
      <Text style={styles.subtitle}>Ruleta y sistema de apuestas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
