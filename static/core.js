const term = new Terminal({
    fontFamily: "monospace",
});

term.loadAddon(new WebLinksAddon.WebLinksAddon());

const search = new SearchAddon.SearchAddon();
term.loadAddon(search);

const fit = new FitAddon.FitAddon();
term.loadAddon(fit);
fit.fit();

function enableWebGl() {
    const webgl = new WebglAddon.WebglAddon();
    webgl.onContextLoss(() => {
        webgl.dispose();
        enableWebGl();
    });
    term.loadAddon(webgl);
}

enableWebGl();

const D = 0x64;
const R = 0x72;

const protocol = (location.protocol === 'https:' ? 'wss' : 'ws');
const port = (location.port ? `:${location.port}` : '');
const socketURL = `${protocol}://${location.hostname}${port}/terminal/`;
const sock = new WebSocket(socketURL);
sock.binaryType = "arraybuffer";
sock.addEventListener('open', () => {
    const listeners = [];
    listeners.push(term.onData(data => {
        sock.send(new Blob(['d', data]));
    }));
    listeners.push(term.onBinary(data => {
        sock.send(new Blob(['d', data]));
    }));
    listeners.push(term.onResize(size => {
        const message = new ArrayBuffer(9);
        const writer = new DataView(message);
        writer.setUint8(0, R);
        writer.setUint32(1, size.cols, true);
        writer.setUint32(5, size.rows, true);
        sock.send(message);
    }));
    sock.addEventListener('close', () => {
        term.writeln("");
        term.writeln("Connection closed.");
        for (const listener of listeners) {
            listener.dispose()
        }
    });
    sock.addEventListener('message', message => {
        if (message.data instanceof ArrayBuffer) {
            const reader = new DataView(message.data);
            const type = reader.getUint8(0);
            if (type == D) {
                term.write(new Uint8Array(message.data.slice(1)))
            } else {
                console.log(`Received unknown message from websocket, type: ${type}`);
            }
        } else {
            console.log(`Received text message from websocket, expected binary`);
        }
    });

    fit.fit()
});

term.open(document.getElementById('terminal'));
window.addEventListener('resize', () => {
    fit.fit()
});