import React, {useState} from 'react';
import QrReader from 'react-qr-scanner';

export default function CaptureBearing() {
  const [result, setResult] = useState('no result');

  const handleScan = data => {
    if (data !== null) {
      setResult(data['text']);
      console.log(data);
      return;
    }
  };

  const camStyle = {};

  const previewStyle = {
    height: 300,
    width: 300,
  };

  const handleError = error => console.error(error);

  return (
    <div style={camStyle}>
      <QrReader delay={100} style={previewStyle} onError={handleError} onScan={handleScan} />
      <p>{result}</p>
    </div>
  );
}
