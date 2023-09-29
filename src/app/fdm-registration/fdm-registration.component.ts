import { Component, ViewChild } from '@angular/core';

import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { StepperOrientation, MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { AsyncPipe, CommonModule } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ValidatorService, AngularIbanModule } from 'angular-iban';
import { StepperSelectionEvent } from '@angular/cdk/stepper';

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
		MatRadioModule,
		AsyncPipe,
		CommonModule,
		AngularIbanModule,
		MatCardModule,
		MatDividerModule
	],
	standalone: true,
})
export class FdmRegistrationComponent {

	@ViewChild(MatStepper) stepper!: MatStepper;
	
	stepperOrientation: Observable<StepperOrientation>;

	emailEntryFormGroup: FormGroup;
	emailVerificationFormGroup: FormGroup;
	contactFormGroup: FormGroup;
	bankFormGroup: FormGroup;

	constructor(private _formBuilder: FormBuilder, breakpointObserver: BreakpointObserver) {
		// setup form controls
		this.emailEntryFormGroup = this._formBuilder.group({
			emailCtrl: ['', [Validators.required, Validators.email]]
		});
		this.emailVerificationFormGroup = this._formBuilder.group({
			emailVerifyCtrl: ['', [Validators.required]]
		});

		this.contactFormGroup = this._formBuilder.group({
			contactTypeCtrl: ['privatperson', [Validators.required]],
			contactNameCtrl: ['', [Validators.required]],
			contactAddressCtrl: [''],
			contactPhoneCtrl: ['']
		});
		this.bankFormGroup = this._formBuilder.group({
			bankAmountCtrl: [''],
			paymentTypeCtrl: ['sepa', [Validators.required]],
			bankNameCtrl: ['', [Validators.required]],
			bankIBANCtrl: ['', [Validators.required, ValidatorService.validateIban]],
			bankOwnerCtrl: ['', [Validators.required]]
		});

		// make form responsive
		this.stepperOrientation = breakpointObserver
			.observe('(min-width: 800px)')
			.pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
	}

	handleOnStepChange(event: StepperSelectionEvent) {
		if (event.selectedStep.stepControl == this.bankFormGroup) {
			this.enterStepBankdata();
		} else if (event.selectedIndex == this.stepper.steps.length - 1) {
			this.updateFormValues();
		}
	}

	handlePaymentTypeChanged(event: MatRadioChange) {
		const bankNameCtrl = this.bankFormGroup.get('bankNameCtrl') as FormControl;
		const bankIBANCtrl = this.bankFormGroup.get('bankIBANCtrl') as FormControl;
		const bankOwnerCtrl = this.bankFormGroup.get('bankOwnerCtrl') as FormControl;

		if (event.value === 'sepa') {
			bankNameCtrl?.setValidators([Validators.required]);
			bankIBANCtrl?.setValidators([Validators.required, ValidatorService.validateIban]);
			bankOwnerCtrl?.setValidators([Validators.required]);
		} else {
			bankNameCtrl?.clearValidators();
			bankIBANCtrl?.clearValidators();
			bankOwnerCtrl?.clearValidators();
		}

		bankNameCtrl?.updateValueAndValidity();
		bankIBANCtrl?.updateValueAndValidity();
		bankOwnerCtrl?.updateValueAndValidity();

	}

	enterStepBankdata() {
		const name = this.contactFormGroup.get('contactNameCtrl') as FormControl;
		const owner = this.bankFormGroup.get('bankOwnerCtrl') as FormControl;
		if (owner?.pristine || ! owner?.dirty) {
			owner?.setValue(name?.getRawValue());
			owner?.updateValueAndValidity();
		}

		const contactType = this.contactFormGroup.get('contactTypeCtrl')?.value;
		const bankAmountCtrl = this.bankFormGroup.get('bankAmountCtrl');

		// update min amount based on type of new member
		if (contactType === 'studierend') {
			bankAmountCtrl?.setValidators([Validators.min(0), Validators.pattern('[0-9]+(\.[0-9]{1,2})?')]);
			if (bankAmountCtrl?.pristine || ! bankAmountCtrl?.dirty) {
				bankAmountCtrl?.setValue(0);
			}
		} else if (contactType === 'privatperson') {
			bankAmountCtrl?.setValidators([Validators.required, Validators.min(12), Validators.pattern('[0-9]+(\.[0-9]{1,2})?')]);
			if (bankAmountCtrl?.pristine || ! bankAmountCtrl?.dirty) {
				bankAmountCtrl?.setValue(12);
			}
		} else {
			bankAmountCtrl?.setValidators([Validators.required, Validators.min(50), Validators.pattern('[0-9]+(\.[0-9]{1,2})?')]);
			if (bankAmountCtrl?.pristine || ! bankAmountCtrl?.dirty) {
				bankAmountCtrl?.setValue(50);
			}
		}

		bankAmountCtrl?.updateValueAndValidity();
	}

	isStudent() : boolean {
		return this.emailEntryFormGroup.get('emailCtrl')?.value.trim().endsWith('students.uni-mainz.de');
	}

	needsBankData() : boolean {
		const contactType = this.contactFormGroup.get('contactTypeCtrl')?.value;

		return !(this.isStudent() && contactType === 'studierend');
	}

	formValues : {
		memberEMail: string;
		memberName: string;
		memberAmount: number;

		contactAddress: string;
		contactPhone: string;

		paymentTypeIsSEPA: boolean;
		bankOwner: string;
		bankName: string;
		bankIBAN: string;
		date: string;
	} = {
		memberEMail: '',
		memberName: '',
		memberAmount: 12,
		contactAddress: '',
		contactPhone: '',
		paymentTypeIsSEPA: false,
		bankOwner: '',
		bankName: '',
		bankIBAN: '',
		date: '',
	};

	updateFormValues() {
		this.formValues.memberEMail = this.emailEntryFormGroup.get('emailCtrl')?.value;
		this.formValues.memberName = this.contactFormGroup.get('contactNameCtrl')?.value;

		this.formValues.contactAddress = this.contactFormGroup.get('contactAddressCtrl')?.value;
		this.formValues.contactPhone = this.contactFormGroup.get('contactPhoneCtrl')?.value;

		this.formValues.bankOwner = this.bankFormGroup.get('bankOwnerCtrl')?.value;
		this.formValues.bankName = this.bankFormGroup.get('bankNameCtrl')?.value;
		this.formValues.bankIBAN = this.bankFormGroup.get('bankIBANCtrl')?.value;

		this.formValues.paymentTypeIsSEPA = this.bankFormGroup.get('paymentTypeCtrl')?.value === 'sepa';

		this.formValues.date = Date();

		const valueStr: string = this.bankFormGroup.get('bankAmountCtrl')?.value.toString();
		this.formValues.memberAmount = Number(valueStr.replace(',','.'));
	}
}
