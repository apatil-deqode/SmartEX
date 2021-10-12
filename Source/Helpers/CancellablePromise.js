export function CancellablePromise(ms) {
    const ret = {};
    
    const signal = new Promise((resolve, reject) => {
        // Callable function that cancels the promise
        ret.cancel = () => {
            reject(new Error("Promise was cancelled"));
        }
    });

    ret.promise = new Promise((res, rej) => {
        const timeOut = setTimeout(() => {
            res("ok");
        }, ms);

        // Catches the error from the signal Promise
        signal.catch(err => {
            rej(err);
            clearTimeout(timeOut);
        });
    });

    return ret;
}