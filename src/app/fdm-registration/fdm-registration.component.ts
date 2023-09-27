import { Component } from '@angular/core';

import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { StepperOrientation, MatStepperModule } from '@angular/material/stepper';
import { AsyncPipe } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
	selector: 'fdm-registration',
	templateUrl: './fdm-registration.component.html',
	styleUrls: ['./fdm-registration.component.css'],
	imports: [
		MatStepperModule,
		FormsModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		AsyncPipe,
	],
	standalone: true,
})
export class FdmRegistrationComponent {
	stepperOrientation: Observable<StepperOrientation>;

	emailEntryFormGroup: FormGroup;
	emailVerificationFormGroup: FormGroup;
	contactFormGroup: FormGroup;
	bankFormGroup: FormGroup;

	constructor(private _formBuilder: FormBuilder, breakpointObserver: BreakpointObserver) {
		this.emailEntryFormGroup = this._formBuilder.group({ emailCtrl: ['', [Validators.required, Validators.email]] });
		this.emailVerificationFormGroup = this._formBuilder.group({ emailVerifyCtrl: ['', [Validators.required]] });
		this.contactFormGroup = this._formBuilder.group({ contactCtrl: [''] });
		this.bankFormGroup = this._formBuilder.group({ bankCtrl: [''] });

		this.stepperOrientation = breakpointObserver
			.observe('(min-width: 800px)')
			.pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
	}
}
