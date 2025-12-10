import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const MathView = ({ math }: { math: string }) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
      <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
      <style>
        body {
          margin: 0;
          padding: 10px;
          background-color: #0B0B28;
          color: white;
        }
      
        mjx-container {
          font-size: 50px;
          
        }
      </style>
    </head>
    <body>
      <p>\\(${math}\\)</p>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 100,
    marginVertical: 8,
  },
  webview: {
    backgroundColor: 'transparent',
    
  },
});

export default MathView;


