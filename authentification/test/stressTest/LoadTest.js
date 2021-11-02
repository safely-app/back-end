import http from 'k6/http';
import { sleep } from 'k6';
export const options = {
  duration: '1m',
  vus: 50,
};
export default function () {
  const res = http.get('http://127.0.0.1:3000/');
  sleep(1);
}
