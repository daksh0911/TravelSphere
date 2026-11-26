import { motion } from 'framer-motion';
import useTilt from '../../hooks/useTilt';

export default function TiltArticle({ style, ...props }) {
  const tilt = useTilt(5);
  return <motion.article {...props} {...tilt} style={{ ...style, ...tilt.style }} />;
}
