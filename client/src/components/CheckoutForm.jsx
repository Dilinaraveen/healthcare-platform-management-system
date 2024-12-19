import React from "react";
import { useStripe, useElements, CardElement, PaymentElement } from "@stripe/react-stripe-js";

const CheckoutForm = ({ onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);

    try {
      const { paymentIntent } = await stripe.confirmCardPayment(
        "{{client_secret}}", // This will be passed dynamically
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (paymentIntent.status === "succeeded") {
        toast.success("Payment Successful!");
        onPaymentSuccess(); // Reset view
      }
    } catch (error) {
      toast.error(error.message || "Payment failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe}
        className="mt-4 py-2 px-4 bg-primary text-white rounded-md"
      >
        Pay Now
      </button>
    </form>
  );
};

export default CheckoutForm;
