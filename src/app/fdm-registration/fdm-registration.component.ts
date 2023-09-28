import { Component } from '@angular/core';

import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { StepperOrientation, MatStepperModule } from '@angular/material/stepper';
import { AsyncPipe, CommonModule } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import {ValidatorService} from 'angular-iban';

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
		CommonModule
	],
	standalone: true,
})
export class FdmRegistrationComponent {
	stepperOrientation: Observable<StepperOrientation>;

	emailEntryFormGroup: FormGroup;
	emailVerificationFormGroup: FormGroup;
	contactFormGroup: FormGroup;
	bankFormGroup: FormGroup;

	newMemberNameSubs: Subscription;

	constructor(private _formBuilder: FormBuilder, breakpointObserver: BreakpointObserver) {
		// setup form controls
		this.emailEntryFormGroup = this._formBuilder.group({ 
			emailCtrl: ['', [Validators.required, Validators.email]]
	 	});
		this.emailVerificationFormGroup = this._formBuilder.group({ 
			emailVerifyCtrl: ['', [Validators.required]]
		});

		this.contactFormGroup = this._formBuilder.group({ 
			contactNameCtrl: ['', [Validators.required]],
			contactAddressCtrl: [''],
			contactPhoneCtrl: ['']
		 });
		this.bankFormGroup = this._formBuilder.group({
			bankAmountCtrl: ['12', [Validators.required, Validators.min(12), Validators.pattern('[0-9]+(\.[0-9]{1,2})?')]],
			bankNameCtrl: ['', [Validators.required]],
			bankIBANCtrl: ['', [Validators.required, ValidatorService.validateIban]],
			bankOwnerCtrl:  ['', [Validators.required]]
		 });

		 let name = this.contactFormGroup.get('contactNameCtrl') as FormControl;
		 let owner = this.bankFormGroup.get('bankOwnerCtrl') as FormControl;
		 this.newMemberNameSubs = name.valueChanges.subscribe((newValue: any) => {
			owner.setValue(newValue);
		 });

		 // make form responsive
		this.stepperOrientation = breakpointObserver
			.observe('(min-width: 800px)')
			.pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
	}

	ngOnDestroy() {
		this.newMemberNameSubs.unsubscribe();
	}
}
