import { log, error } from '@/modules/Logger'

let worker = null;
if (window.Worker) {
  worker = new Worker("./src/modules/worker/sqliteWorker.js", { type: 'module' });
  if (worker) {
    worker.onmessage = function (e) {
      if (e.data.type == "application/x-sqlite3") {
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.href = window.URL.createObjectURL(e.data);
        a.download = ("jsboilerplate.sqlite3");
        a.addEventListener('click', function () {
          setTimeout(function () {
            window.URL.revokeObjectURL(a.href);
            a.remove();
          }, 500);
        });
        a.click();
      } else {
        const bc = new BroadcastChannel("result_channel");
        bc.postMessage(e.data);
        bc.close();
      }
    }
  }
} else {
  error('Your browser doesn\'t support web workers.');
}

// TODO create an API
export function validateAndPost(json) {
  if (worker) {
    // TODO validate
    worker.postMessage(json);
  } else {
    error('Your browser doesn\'t support web workers.');
  }
}


