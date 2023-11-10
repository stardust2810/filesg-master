import JsBarcode from 'jsbarcode';
import { useEffect, useRef } from 'react';

import { StyleProps } from '../../../../typings';

type Props = {
  value: string;
  options?: JsBarcode.Options;
} & StyleProps;

export const Barcode = ({ value, options, className, style }: Props) => {
  const barcodeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = barcodeRef.current;

    if (element) {
      JsBarcode(element, value, options);
    }
  }, [options, value]);

  return <canvas className={className} style={style} ref={barcodeRef} />;
};
