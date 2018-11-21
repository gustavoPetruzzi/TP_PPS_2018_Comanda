import { UtilProvider } from './../../../providers/util/util';
import { IReserva } from './../../../clases/IReserva';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController } from 'ionic-angular';
import { ReservaProvider } from '../../../providers/reserva/reserva';

@IonicPage()
@Component({
  selector: 'page-reserva-cliente',
  templateUrl: 'reserva-cliente.html',
})


export class ReservaClientePage {
  @ViewChild('btnHoy') botonHoy: ElementRef;

  public formGroup: FormGroup;
  public currentEvents: any;
  public fecha: string;
  public fechaSeleccionada: string;
  public reserva: IReserva;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public menuCtrl: MenuController,
    public _util: UtilProvider,
    public _reserva: ReservaProvider
  ) {
    this.menuCtrl.enable(true, 'menu');
    this.formGroup = this.crearFormulario();

    this.currentEvents = [
      {
        year: 2018,
        month: 11,
        date: 25
      },
      {
        year: 2018,
        month: 11,
        date: 31
      },
      {
        year: 2018,
        month: 11,
        date: 24
      },
      {
        year: 2019,
        month: 0,
        date: 1
      },
      {
        year: 2018,
        month: 11,
        date: 8
      },
      {
        year: 2018,
        month: 11,
        date: 31
      },
      {
        year: 2019,
        month: 0,
        date: 6
      }

    ];
  }

  guardarReserva() {
    if (this.formGroup.value.comensales > 0 && this.formGroup.value.turno && this.fecha) {
      let diaActual = new Date().getTime();
      let reserva = {
        id: diaActual,
        clienteId: localStorage.getItem('userID'),
        turno: this.formGroup.value.turno,
        fecha: this.fechaSeleccionada,
        comensales: this.formGroup.value.comensales,
        estado: 'pendiente'
      };
      this._util.presentLoading('Enviando reserva...');
      setTimeout(() => {
        this._reserva.guardarReserva(reserva).then(() => {
          this._util.dismiss().then(() => {
            this._util.esperar(this._util.creaFondo("Le enviaremos la confirmación de su reserva", "assets/imgs/icono_rest.png"));
            setTimeout(() => {
              this._util.dismiss().then(() => {
                this._util.volverRoot();
              })
            }, 3000);
          });
        });
      }, 2000);
    }
  }

  private crearFormulario() {
    return this.formBuilder.group({
      turno: ['', Validators.required],
      fechaCalendario: ['', Validators.required],
      comensales: ['', Validators.compose([Validators.pattern('[0-9]{1,2}'), Validators.required])]
    });
  }

  public seleccionarDia(e) {
    let dia = (e.date).toString();
    if (dia.length == 1) {
      dia = `0${dia}`;
    }
    let mes = e.month + 1;
    mes = (mes).toString();
    if (mes.length == 1) {
      mes = `0${mes}`;
    }
    let anio = e.year;
    this.fecha = `${dia}/${mes}/${anio}`;
    this.fechaSeleccionada = `${dia}${mes}${anio}`;
  }

  public seleccionarMes(e) {
    console.log(e);
  }
}