Stripe.setPublishableKey('pk_test_g6do5S237ekq10r65BnxO6S0');

var $form = $('#checkout-form');

$form.submit(function(event) {
    $('#charge-error').removeClass('hidden');
	$form.find('button').prop('disabled', true);

	Stripe.card.createToken(
		{
			number: $('#card-number').val(),
			cvc: $('#card-cvc').val(),
			exp_month: $('#card-expiry-month').val(),
			exp_year: $('#card-expiry-year').val(),
			address_zip: $('#card-name').val(),
		},
		stripeResponseHandler,
	);
	return false;
});

function stripeResponseHandler(status, response) {
	// Grab the form:
	if (response.error) {
		// Problem!

		// Show the errors on the form:
		$('#charge-error').text(response.error.message);
		$('#charge-error').removeClass('hidden');
		$form.find('button').prop('disabled', false); // Re-enable submission
	} else {
		// Token created!

		// Get the token ID:
		var token = response.id;

		// Insert the token into the form so it gets submitted to the server:
		$form.append(
			$('<input type="hidden" name="stripeToken" />').val(token),
		);

		// Submit the form:
		$form.get(0).submit();
	}
}
