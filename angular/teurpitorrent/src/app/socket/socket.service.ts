import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  baseUrl = 'ws://localhost:3000'; //todo change this

  private socket?: Socket;

  constructor() {
    this.socket = undefined;
  }

  connect(token: string) {
    if (this.socket?.connected) {
      console.log('Already connected to server');
      return;
    }

    console.log('Connecting to server with token:', token);

    this.socket = io(this.baseUrl, {
      reconnectionDelayMax: 10000,
      auth: {
        token: token
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  isConnected(): boolean {
    return this.socket ? this.socket.connected : false;
  }

  sendEvent(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  onEvent(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }
}
