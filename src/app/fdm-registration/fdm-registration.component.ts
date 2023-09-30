import { Component, ViewChild, inject } from '@angular/core';

import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { StepperOrientation, MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { AsyncPipe, CommonModule, Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ValidatorService, AngularIbanModule } from 'angular-iban';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Auth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, connectAuthEmulator } from '@angular/fire/auth';
import { MatIconModule } from '@angular/material/icon';

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
		MatDividerModule,
		MatSnackBarModule,
		MatProgressSpinnerModule,
		MatIconModule,
	],
	standalone: true,
	providers: [Location, { provide: LocationStrategy, useClass: PathLocationStrategy }],
})
export class FdmRegistrationComponent {

	private EMAIL_URL: string = "https://fdm-anmeldung.web.app/";

	private auth: Auth = inject(Auth);

	location: Location;

	@ViewChild(MatStepper) stepper!: MatStepper;

	stepperOrientation: Observable<StepperOrientation>;

	emailEntryFormGroup: FormGroup;
	emailVerificationFormGroup: FormGroup;
	contactFormGroup: FormGroup;
	bankFormGroup: FormGroup;

	private emailIsVerified: boolean = false;
	private verifyButtonIsDisabled: boolean = false;

	constructor(private _formBuilder: FormBuilder, breakpointObserver: BreakpointObserver, location: Location, private _snackBar: MatSnackBar) {
		this.location = location;

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

	ngOnInit() {
		connectAuthEmulator(this.auth, 'https://special-palm-tree-gx955jv667rcp4xw-9099.app.github.dev/', { disableWarnings: true });

		console.log(this.location.path(false));
		console.log(window.location.href);

		if (isSignInWithEmailLink(this.auth, window.location.href)) {
			this.handleVerifiedEMail();
		}

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
		if (owner?.pristine || !owner?.dirty) {
			owner?.setValue(name?.getRawValue());
			owner?.updateValueAndValidity();
		}

		const contactType = this.contactFormGroup.get('contactTypeCtrl')?.value;
		const bankAmountCtrl = this.bankFormGroup.get('bankAmountCtrl');

		// update min amount based on type of new member
		if (contactType === 'studierend') {
			bankAmountCtrl?.setValidators([Validators.min(0), Validators.pattern('[0-9]+(\.[0-9]{1,2})?')]);
			if (bankAmountCtrl?.pristine || !bankAmountCtrl?.dirty) {
				bankAmountCtrl?.setValue(0);
			}
		} else if (contactType === 'privatperson') {
			bankAmountCtrl?.setValidators([Validators.required, Validators.min(12), Validators.pattern('[0-9]+(\.[0-9]{1,2})?')]);
			if (bankAmountCtrl?.pristine || !bankAmountCtrl?.dirty) {
				bankAmountCtrl?.setValue(12);
			}
		} else {
			bankAmountCtrl?.setValidators([Validators.required, Validators.min(50), Validators.pattern('[0-9]+(\.[0-9]{1,2})?')]);
			if (bankAmountCtrl?.pristine || !bankAmountCtrl?.dirty) {
				bankAmountCtrl?.setValue(50);
			}
		}

		bankAmountCtrl?.updateValueAndValidity();
	}

	isStudent(): boolean {
		return this.emailEntryFormGroup.get('emailCtrl')?.value.trim().endsWith('students.uni-mainz.de');
	}

	needsBankData(): boolean {
		const contactType = this.contactFormGroup.get('contactTypeCtrl')?.value;

		return !(this.isStudent() && contactType === 'studierend');
	}

	formValues: {
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
		this.formValues.memberAmount = Number(valueStr.replace(',', '.'));
	}

	verfiyEMailAddress() {
		if (this.emailEntryFormGroup.invalid)
			return;

		// https://firebase.google.com/docs/auth/web/email-link-auth?hl=en&authuser=0
		const actionCodeSettings = {
			// URL you want to redirect back to. The domain (www.example.com) for this
			// URL must be in the authorized domains list in the Firebase Console.
			url: this.EMAIL_URL,
			// This must be true.
			handleCodeInApp: true,
		};

		const email = this.emailEntryFormGroup.get('emailCtrl')?.getRawValue();

		this.verifyButtonIsDisabled = true;
		sendSignInLinkToEmail(this.auth, email, actionCodeSettings)
			.then(() => {
				// The link was successfully sent. Inform the user.
				// Save the email locally so you don't need to ask the user for it again
				// if they open the link on the same device.
				window.localStorage.setItem('emailForSignIn', email);

				this._snackBar.open(`E-Mail Nachricht an ${email} gesendet.`, '', {
					duration: 5000
				});
			})
			.catch((error) => {
				this._snackBar.open(`E-Mail Nachricht an ${email} konnte nicht gesendet werden.`, '', {
					duration: 5000
				});
				console.log(error);
				this.verifyButtonIsDisabled = false;
			});

		//this.verifyButtonIsDisabled = false;
	}

	handleVerifiedEMail() {
		let email = window.localStorage.getItem('emailForSignIn');
		if (!email) {
			return;
		}

		// The client SDK will parse the code from the link for you.
		signInWithEmailLink(this.auth, email, window.location.href)
			.then((result) => {
				// Clear email from storage.
				window.localStorage.removeItem('emailForSignIn');
				// You can access the new user via result.user
				// Additional user info profile not available via:
				// result.additionalUserInfo.profile == null
				// You can check if the user is new or existing:
				// result.additionalUserInfo.isNewUser
				console.log(result);

				this.emailIsVerified = true;

				this.emailEntryFormGroup.get('emailCtrl')?.setValue(email);
				this.emailEntryFormGroup.get('emailCtrl')?.updateValueAndValidity();

				this.stepper.steps.first.completed = true;

				this.stepper.steps.get(1)?.select;
			})
			.catch((error) => {
				// Some error occurred, you can inspect the code: error.code
				// Common errors could be invalid email and invalid or expired OTPs.
				console.log(error);
			});
	}

	isEmailVerfied(): boolean {
		return this.emailIsVerified;
	}

	isVerfiyButtonDisabled(): boolean {
		return this.verifyButtonIsDisabled;
	}
}
