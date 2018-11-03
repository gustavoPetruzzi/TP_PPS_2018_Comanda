import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, LoadingController, Loading} from 'ionic-angular';
import {Camera, CameraOptions} from '@ionic-native/camera';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AngularFireDatabase } from 'angularfire2/database';
import { IPlato } from '../../../clases/IPlato';
import {platosProvider} from '../../../providers/platos/plato';
//import { Observable } from '@firebase/util';
import {MesasPage} from '../../mesasPages/mesas/mesas'
import { Subscription } from 'rxjs';
import {map} from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

/**
 * Generated class for the AltaPlatoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-alta-plato',
  templateUrl: 'alta-plato.html',
})
export class AltaPlatoPage {
  @ViewChild(Slides) slides: Slides;
  ingredientes:string;
  preparacion:string;
  preparado:string;
  nombre:string;
  importe:number;
  categoria:string;
  descripcion:string;
  image:string;
  task:AngularFireUploadTask;
  rutaArchivo:string;
  fotoIngredientesTomada:boolean;
  fotoPreparacionTomada:boolean;
  fotoPreparadoTomada:boolean;
  urlIngredientes:string;
  urlPreparacion:string;
  urlPreparado:string;
  platos:Observable<IPlato[]>;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public camera:Camera,
    public storage: AngularFireStorage,
    private db: AngularFirestore,
    public loadingCtrl:LoadingController,
    public platoProveedor:platosProvider
    ) 
  {
    this.ingredientes = "assets/imgs/ingredientes.png";
    this.preparacion = "assets/imgs/cocinando.png";
    this.preparado = "assets/imgs/preparado.png";
    this.fotoIngredientesTomada = false;
    this.fotoPreparacionTomada = false;
    this.fotoPreparadoTomada = false;

    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AltaPlatoPage');
  }

  public inicio(){
    this.navCtrl.setRoot(MesasPage) // Cambiar por menu principal de cocinero
  }
  public siguiente(){
    this.slides.lockSwipes(false);
    this.slides.slideNext();
  }
  onIonDrag(event){
    this.slides.lockSwipes(true);
  }

  public anterior(){
    this.slides.lockSwipes(false);
    this.slides.slidePrev();
  }

  public captureImage(cual:string){
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      sourceType: this.camera.PictureSourceType.CAMERA
    }


    switch (cual) {
      case 'ingredientes':
        this.camera.getPicture(options)
        .then(data =>{
          this.ingredientes = 'data:image/jpg;base64,' + data;
        })
        this.fotoIngredientesTomada = true;
        break;
      case 'preparacion':
        this.camera.getPicture(options)
        .then(data =>{
          this.preparacion = 'data:image/jpg;base64,' + data;
        })
        this.fotoPreparacionTomada = true;
        break;
      case 'preparado':
        this.camera.getPicture(options)
        .then(data =>{
          this.preparado = 'data:image/jpg;base64,' + data;
        })
        this.fotoPreparadoTomada = true;
        break;
      default:
        break;
    }
  }

  public subir(){
    let loading = this.loadingCtrl.create({
      content: `Cargando plato`
    })
    let nuevo:IPlato ={
      nombre: this.nombre,
      importe: this.importe,
      categoria: this.categoria,
      descripcion: this.descripcion,
      ingredientesFoto: "",
      preparacionFoto: "",
      preparadoFoto: "",
    }
    loading.present();
    this.createUploadTask(this.ingredientes)
    .then(res =>{
      this.storage.ref(this.rutaArchivo).getDownloadURL().toPromise()
      .then(urlImagen =>{
        nuevo.ingredientesFoto = urlImagen;
        this.createUploadTask(this.preparacion)
        .then(res =>{
          this.storage.ref(this.rutaArchivo).getDownloadURL().toPromise()
          .then(urlImagen =>{
            nuevo.preparacionFoto = urlImagen;
            this.createUploadTask(this.preparado)
            .then(res =>{
              this.storage.ref(this.rutaArchivo).getDownloadURL().toPromise()
              .then(urlImagen =>{
                nuevo.preparadoFoto =urlImagen;
                this.platoProveedor.guardarPlato(nuevo)
                .then(res =>{
                  loading.dismiss();
                  let platoCargado = this.esperar(this.creaFondo("¡Plato Cargado!", "assets/imgs/icono_restaurant.png"))
                  platoCargado.present();
                  setTimeout(() => {
                    platoCargado.dismiss();
                  }, 4000);
                })
              })
            })
          })
        })
      })
    })
  }

  public createUploadTask(file: string) {

    this.rutaArchivo = `platos/${this.nombre}_${ new Date().getTime() }.jpg`;
    this.image = 'data:image/jpg;base64,' + file;
    
    this.task = this.storage.ref(this.rutaArchivo).putString(file, 'data_url');

    return this.task;
  } 

  creaFondo(mensaje, imagen) {
    let fondo = `
          <div>
            <ion-row>
              <ion-col>
                <img src="${imagen}">
              </ion-col>
            </ion-row>
            <ion-row>
              <h1> ${mensaje} </h1>
            </ion-row> 
          </div> `;
    return fondo;

  }
  esperar(personalizado?: string): Loading {
    let loading;
    if (!personalizado) {
      loading = this.loadingCtrl.create({

        content: 'Por favor, espere...'
      });
    }
    else {
      loading = this.loadingCtrl.create({
        spinner: 'hide',
        content: personalizado,
      })
    }
    return loading;
  }

}
