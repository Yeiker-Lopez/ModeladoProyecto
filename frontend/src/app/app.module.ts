import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { LoginComponent } from "./login/login.component";
import { NgModule } from "@angular/core";



@NgModule({
    /* declarations: [
        AppComponent,
        LoginComponent
    ],
 */
    imports: [
        BrowserModule,
        AppComponent,
        LoginComponent

    ],
    providers: [

    ],
    bootstrap: []

})
export class AppModule { }