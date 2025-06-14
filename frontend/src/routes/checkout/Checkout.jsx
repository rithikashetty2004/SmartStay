import React, { useEffect, useState } from 'react';
import FinalBookingSummary from './components/final-booking-summary/FinalBookingSummary';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { getReadableMonthFormat } from 'utils/date-helpers';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from 'contexts/AuthContext';
import { useContext } from 'react';
import { networkAdapter } from 'services/NetworkAdapter';
import Loader from 'components/ux/loader/loader';
import Toast from 'components/ux/toast/Toast';

/**
 * Checkout component for processing payments and collecting user information.
 *
 * @returns {JSX.Element} The rendered Checkout component.
 */
const Checkout = () => {
  const [errors, setErrors] = useState({});

  const location = useLocation();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const [toastMessage, setToastMessage] = useState('');

  const { isAuthenticated, userDetails } = useContext(AuthContext);

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

  const [paymentConfirmationDetails, setPaymentConfirmationDetails] = useState({
    isLoading: false,
    data: {},
  });

  const dismissToast = () => {
    setToastMessage('');
  };

  // Form state for collecting user payment and address information
  const [formData, setFormData] = useState({
    email: userDetails?.email ? userDetails?.email : '',
    nameOnCard: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
  });

  // Format the check-in and check-out date and time
  const checkInDateTime = `${getReadableMonthFormat(
    searchParams.get('checkIn')
  )}, ${location.state?.checkInTime}`;
  const checkOutDateTime = `${getReadableMonthFormat(
    searchParams.get('checkOut')
  )}, ${location.state?.checkOutTime}`;

  useEffect(() => {
    const locationState = location.state;
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    if (!locationState || !checkIn || !checkOut) {
      const hotelCode = searchParams.get('hotelCode');
      navigate(`/hotel/${hotelCode}`);
    }
  }, [location, navigate, searchParams]);

  /**
   * Handle form input changes and validate the input.
   * @param {React.ChangeEvent<HTMLInputElement>} e The input change event.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    const isValid = validationSchema[name](value);
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: !isValid });
  };

  /**
   * Handle form submission and validate the form.
   * @param {React.FormEvent<HTMLFormElement>} e The form submission event.
   * @returns {void}
   * @todo Implement form submission logic.
   * @todo Implement form validation logic.
   * @todo Implement form submission error handling.
   * @todo Implement form submission success handling.
   * @todo Implement form submission loading state.
   * @todo Implement form submission error state.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    let isValid = true;
    const newErrors = {};

    // Validate form fields
    Object.keys(formData).forEach((field) => {
      const isFieldValid = validationSchema[field](formData[field]);
      newErrors[field] = !isFieldValid;
      isValid = isValid && isFieldValid;
    });

    setErrors(newErrors);

    if (!isValid) {
      return; // Stop if there are validation errors
    }

    // Set loading state to true before showing the spinner
    setPaymentConfirmationDetails({
      isLoading: true,
      data: {},
    });

    // Simulate the dynamic information generation
    const hotelName = searchParams.get('hotelName').replaceAll('-', ' '); // Format hotelName
    const checkInDate = checkInDateTime; // Assume checkInDateTime is set correctly
    const checkOutDate = checkOutDateTime; // Assume checkOutDateTime is set correctly
    const totalFare = location.state?.total || 0; // Ensure totalFare is available

    // Generate dynamic booking details
    const bookingDetails = [
      { label: 'Booking ID', value: `BKG${Math.floor(Math.random() * 1000)}` }, // Random Booking ID
      { label: 'Booking Date', value: new Date().toISOString().split('T')[0] }, // Current date
      { label: 'Hotel Name', value: hotelName },
      { label: 'Check-in Date', value: checkInDate },
      { label: 'Check-out Date', value: checkOutDate },
      { label: 'Total Fare', value: `₹${totalFare}` },
    ];

    // Simulate a small delay (to show the loading spinner)
    setTimeout(() => {
      // After the delay, set the payment confirmation details with the generated booking details
      setPaymentConfirmationDetails({
        isLoading: false, // Hide the spinner once the data is ready
        data: {
          status: 'Payment successful',
          bookingDetails: bookingDetails,
        },
      });

      // Navigate to the confirmation page with dynamic data
      const formattedHotelName = hotelName.replaceAll(' ', '_'); // Format for URL
      navigate(
        `/booking-confirmation?payment=sucess&hotel=${formattedHotelName}`,
        {
          state: {
            confirmationData: {
              status: 'Payment successful',
              bookingDetails: bookingDetails,
            },
          },
        }
      );
    }, 2000); // Set a 2-second delay for the loading spinner
  };

  return (
    <div className="flex flex-col justify-center items-center">
      {/* Final Booking Summary */}
      <FinalBookingSummary
        hotelName={searchParams.get('hotelName').replaceAll('-', ' ')}
        checkIn={checkInDateTime}
        checkOut={checkOutDateTime}
        isAuthenticated={isAuthenticated}
        phone={userDetails?.phone}
        email={userDetails?.email}
        fullName={userDetails?.fullName}
      />

      {/* Payment Form Container */}
      <div className="relative bg-white border shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-lg mx-auto">
        {/* Show loader if payment is in progress */}
        {paymentConfirmationDetails.isLoading && (
          <Loader
            isFullScreen={true}
            loaderText={'Payment in progress, hold tight!'}
          />
        )}

        {/* Payment Form */}
        <form
          onSubmit={handleSubmit}
          className={`${
            paymentConfirmationDetails.isLoading ? 'opacity-40' : ''
          }`}
        >
          {/* Email Field */}
          <InputField
            label="Email address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required={true}
            error={errors.email}
          />

          {/* Name on Card Field */}
          <InputField
            label="Name on card"
            type="text"
            name="nameOnCard"
            value={formData.nameOnCard}
            onChange={handleChange}
            placeholder="Name as it appears on card"
            required={true}
            error={errors.nameOnCard}
          />

          {/* Card Number Field */}
          <InputField
            label="Card number"
            type="text"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleChange}
            placeholder="0000 0000 0000 0000"
            required={true}
            error={errors.cardNumber}
          />

          {/* Expiration Date & CVC */}
          <div className="flex mb-4 justify-between">
            <InputField
              label="Expiration date (MM/YY)"
              type="text"
              name="expiry"
              value={formData.expiry}
              onChange={handleChange}
              placeholder="MM/YY"
              required={true}
              error={errors.expiry}
            />
            <InputField
              label="CVC"
              type="text"
              name="cvc"
              value={formData.cvc}
              onChange={handleChange}
              placeholder="CVC"
              required={true}
              error={errors.cvc}
            />
          </div>

          {/* Address Field */}
          <InputField
            label="Address"
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Street Address"
            required={true}
            error={errors.address}
          />

          {/* City Field */}
          <InputField
            label="City"
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
            required={true}
            error={errors.city}
          />

          {/* State and Postal Code */}
          <div className="flex mb-4 justify-between">
            <InputField
              label="State / Province"
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="State"
              required={true}
              error={errors.state}
            />
            <InputField
              label="Postal code"
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="Postal Code"
              required={true}
              error={errors.postalCode}
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <button
              className={`bg-brand hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-300 ${
                isSubmitDisabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-blue-700'
              }`}
              type="submit"
              disabled={isSubmitDisabled}
            >
              Pay ₹ {location.state?.total}
            </button>
          </div>
        </form>

        {/* Show Toast Message if available */}
        {toastMessage && (
          <div className="my-4">
            <Toast
              message={toastMessage}
              type={'error'}
              dismissError={dismissToast}
            />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Generic Input field component for collecting user information.
 * @param {Object} props The component props.
 * @param {string} props.label The input field label.
 * @param {string} props.type The input field type.
 * @param {string} props.name The input field name.
 * @param {string} props.value The input field value.
 * @param {Function} props.onChange The input field change handler.
 * @param {string} props.placeholder The input field placeholder.
 * @param {boolean} props.required The input field required status.
 * @param {boolean} props.error The input field error status.
 *
 * @returns {JSX.Element} The rendered InputField component.
 */
const InputField = ({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  required,
  error,
}) => (
  <div className="mb-4">
    <label
      className="block text-gray-700 text-sm font-bold mb-2"
      htmlFor={name}
    >
      {label}
    </label>
    <input
      className={`shadow appearance-none border ${
        error ? 'border-red-500' : 'border-gray-300'
      } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
      id={name}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      aria-invalid={error ? 'true' : 'false'}
    />
    {error && (
      <p className="text-red-500 text-xs my-1">Please check this field.</p>
    )}
  </div>
);

// Validation schema for form fields
const validationSchema = {
  email: (value) => /\S+@\S+\.\S+/.test(value),
  nameOnCard: (value) => value.trim() !== '',
  cardNumber: (value) => /^\d{16}$/.test(value), // Simplistic validation: just check if it has 16 digits.
  expiry: (value) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(value), // MM/YY format
  cvc: (value) => /^\d{3,4}$/.test(value), // 3 or 4 digits
  address: (value) => value.trim() !== '',
  city: (value) => value.trim() !== '',
  state: (value) => value.trim() !== '',
  postalCode: (value) => /^\d{6}$/.test(value),
};

export default Checkout;
