import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  FileDown,
  Fuel,
  Gauge,
  Luggage,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users
} from 'lucide-react';
import SmartImage from '../../../components/common/SmartImage';
import CheckoutModal from '../../../components/common/CheckoutModal/CheckoutModal';
import usePageTitle from '../../../hooks/usePageTitle';
import { useCurrency } from '../../../context/useCurrency';
import { useAuth } from '../../../context/useAuth';
import api from '../../../services/api';
import { generateBookingPDF } from '../../../utils/pdfVoucher';
import {
  COMMON_RENTAL_HUBS,
  VEHICLES,
  getRentalButtonLabel,
  getRentalSpecifications,
  getVehicleById,
  normalizeApiVehicle
} from '../../../data/vehicleCatalog';
import './VehicleBooking.css';

const addDaysIso = (baseDateStr, days) => {
  const base = baseDateStr ? new Date(`${baseDateStr}T00:00:00`) : new Date();
  if (Number.isNaN(base.getTime())) return new Date().toISOString().split('T')[0];
  base.setDate(base.getDate() + days);
  return base.toISOString().split('T')[0];
};

const todayIso = () => new Date().toISOString().split('T')[0];

const PICKUP_TIMES = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '02:00 PM',
  '04:00 PM',
  '06:00 PM'
];

const getAddonCatalog = (vehicle, isBike) => {
  if (isBike) {
    return [
      { id: 'panniers', label: 'Dual Touring Side Panniers', pricePerDay: 14, desc: 'Lockable waterproof hard cases' },
      { id: 'action-cam', label: 'Action Cam & Handlebar Mount', pricePerDay: 10, desc: '4K mount + extra battery pack' },
      { id: 'intercom', label: 'Rider-Passenger Bluetooth Intercom', pricePerDay: 8, desc: 'Mesh helmet audio link' }
    ];
  }
  const items = [
    { id: 'wifi', label: 'Unlimited 5G In-Car Wi-Fi', pricePerDay: 8, desc: 'Connect up to 5 devices' },
    { id: 'gps', label: 'Offline Alpine & City GPS Unit', pricePerDay: 6, desc: 'Dedicated windshield mount' }
  ];
  if (vehicle?.childSeats > 0) {
    items.unshift({
      id: 'child-seat',
      label: `ISOFIX Child Safety Seat (up to ${vehicle.childSeats})`,
      pricePerDay: 12,
      desc: 'Sanitized rear-facing or booster'
    });
  }
  return items;
};

function VehicleBookingInner({ id }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { formatPrice, currency } = useCurrency();
  const { user } = useAuth();

  const initialVehicle = location.state?.vehicle || getVehicleById(id) || null;
  const [apiVehicle, setApiVehicle] = useState(null);
  const [loading, setLoading] = useState(() => !initialVehicle);

  const vehicle = initialVehicle || apiVehicle;

  const minToday = useMemo(() => todayIso(), []);
  const [pickupDate, setPickupDate] = useState(() => addDaysIso(todayIso(), 3));
  const [returnDate, setReturnDate] = useState(() => addDaysIso(todayIso(), 6));
  const [pickupTime, setPickupTime] = useState('10:00 AM');
  const [pickupLocationOverride, setPickupLocationOverride] = useState(null);
  const [returnHubMode, setReturnHubMode] = useState('same');
  const [customReturnHub, setCustomReturnHub] = useState('City Center Hub');
  const [serviceType, setServiceType] = useState('self-drive');
  const [protectionPlan, setProtectionPlan] = useState('standard');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [travelersOverride, setTravelersOverride] = useState(null);

  const [renterNameOverride, setRenterNameOverride] = useState(null);
  const [renterEmailOverride, setRenterEmailOverride] = useState(null);
  const [renterPhoneOverride, setRenterPhoneOverride] = useState(null);
  const [specialNotes, setSpecialNotes] = useState('');

  const [touched, setTouched] = useState({});
  const [submittedAttempt, setSubmittedAttempt] = useState(false);
  const [liveStatusMsg, setLiveStatusMsg] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState(null);
  const [confirmedReservation, setConfirmedReservation] = useState(null);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const pickupHubRef = useRef(null);
  const pickupDateRef = useRef(null);
  const returnDateRef = useRef(null);

  // Fetch live partner vehicle from API only when not present in the static fleet
  useEffect(() => {
    if (initialVehicle) return undefined;
    let active = true;
    api.get('/vehicles')
      .then((res) => {
        if (!active) return;
        const apiVehicles = Array.isArray(res.data?.vehicles) ? res.data.vehicles.map(normalizeApiVehicle) : [];
        setApiVehicle(getVehicleById(id, apiVehicles));
      })
      .catch(() => {
        if (active) setApiVehicle(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, initialVehicle]);

  const pickupLocation = pickupLocationOverride ?? (vehicle?.pickup || 'Airport & City Delivery');
  const travelers = travelersOverride ?? Math.min(2, vehicle?.seats || 2);
  const renterName = renterNameOverride ?? (user?.name || '');
  const renterEmail = renterEmailOverride ?? (user?.email || '');
  const renterPhone = renterPhoneOverride ?? (user?.phone || '');

  const specs = useMemo(() => getRentalSpecifications(vehicle), [vehicle]);
  const isBike = specs.isBike;
  const pageTitle = vehicle
    ? `${vehicle.name} · ${isBike ? 'Book Rental Bike' : 'Book Rental Car'}`
    : 'Vehicle Rental Booking';
  usePageTitle(pageTitle);

  const addonOptions = useMemo(() => getAddonCatalog(vehicle, isBike), [vehicle, isBike]);

  const rentalDays = useMemo(() => {
    const start = new Date(`${pickupDate}T00:00:00`);
    const end = new Date(`${returnDate}T00:00:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  }, [pickupDate, returnDate]);

  const dailyBaseCost = (vehicle?.price || 0) * rentalDays;
  const driveModeFee = serviceType === 'chauffeur' ? 45 * rentalDays : serviceType === 'airport-vip' ? 25 : 0;
  const coverageFee = protectionPlan === 'full' ? 18 * rentalDays : 0;
  const oneWayFee = returnHubMode === 'different' ? 35 : 0;
  const addonsCost = useMemo(
    () =>
      selectedAddons.reduce((sum, addonId) => {
        const found = addonOptions.find(a => a.id === addonId);
        return sum + (found ? found.pricePerDay * rentalDays : 0);
      }, 0),
    [selectedAddons, addonOptions, rentalDays]
  );

  const totalAmount = dailyBaseCost + driveModeFee + coverageFee + oneWayFee + addonsCost;

  const relatedVehicles = useMemo(() => {
    if (!vehicle) return VEHICLES.slice(0, 3);
    const sameCategory = VEHICLES.filter(v => v.category === vehicle.category && String(v.id) !== String(vehicle.id));
    return sameCategory.slice(0, 3);
  }, [vehicle]);

  const validationErrors = useMemo(() => {
    const errors = {};
    if (!renterName.trim() || renterName.trim().length < 2) {
      errors.renterName = 'Enter the primary driver or rider full name (at least 2 characters).';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(renterEmail.trim())) {
      errors.renterEmail = 'Enter an email address in the format you@example.com for voucher delivery.';
    }
    if (renterPhone.replace(/\D/g, '').length < 7) {
      errors.renterPhone = 'Enter a contact phone number with at least 7 digits.';
    }
    if (!pickupLocation.trim() || pickupLocation.trim().length < 3) {
      errors.pickupLocation = 'Enter a pickup hub or delivery address (at least 3 characters).';
    }
    if (!pickupDate || pickupDate < minToday) {
      errors.pickupDate = 'Choose a pickup date that is today or in the future.';
    }
    if (!returnDate || returnDate < pickupDate) {
      errors.returnDate = 'Return date must be on or after the pickup date.';
    }
    return errors;
  }, [renterName, renterEmail, renterPhone, pickupLocation, pickupDate, returnDate, minToday]);

  const showErrorFor = (field) => Boolean((touched[field] || submittedAttempt) && validationErrors[field]);

  const markTouched = (field) => {
    setTouched(prev => (prev[field] ? prev : { ...prev, [field]: true }));
  };

  const toggleAddon = (addonId) => {
    setSelectedAddons(prev => (
      prev.includes(addonId) ? prev.filter(item => item !== addonId) : [...prev, addonId]
    ));
  };

  const handlePickupDateChange = (nextStart) => {
    setPickupDate(nextStart);
    if (nextStart && returnDate && returnDate < nextStart) {
      setReturnDate(addDaysIso(nextStart, 1));
    }
  };

  const handleProceedToCheckout = (e) => {
    e.preventDefault();
    setSubmittedAttempt(true);

    if (Object.keys(validationErrors).length > 0) {
      const order = [
        ['renterName', nameRef],
        ['renterEmail', emailRef],
        ['renterPhone', phoneRef],
        ['pickupLocation', pickupHubRef],
        ['pickupDate', pickupDateRef],
        ['returnDate', returnDateRef]
      ];
      const firstInvalid = order.find(([key]) => validationErrors[key]);
      if (firstInvalid) {
        const [fieldKey, ref] = firstInvalid;
        setLiveStatusMsg(validationErrors[fieldKey]);
        ref.current?.focus();
      }
      return;
    }

    setLiveStatusMsg('');
    const effectiveReturnHub = returnHubMode === 'different' ? customReturnHub.trim() || pickupLocation.trim() : pickupLocation.trim();
    const serviceLabel = serviceType === 'chauffeur'
      ? (isBike ? 'Guided Road Captain' : 'Private Chauffeur')
      : serviceType === 'airport-vip'
        ? 'Airport VIP Express Delivery'
        : (isBike ? 'Self-Ride Motorcycle Rental' : 'Self-Drive Car Rental');
    const coverageLabel = protectionPlan === 'full' ? 'Zero-Excess Full Protection' : 'Standard Coverage';
    const addonNames = selectedAddons
      .map(addonId => addonOptions.find(a => a.id === addonId)?.label)
      .filter(Boolean);

    setCheckoutDetails({
      title: `${vehicle.name} (${vehicle.type})`,
      type: 'car',
      rentalKind: isBike ? 'bike' : 'car',
      id: vehicle.id,
      vehicleId: vehicle.id,
      subtotal: totalAmount,
      startDate: pickupDate,
      endDate: returnDate,
      guests: travelers,
      destination: `${pickupLocation.trim()} → ${effectiveReturnHub}`,
      image: vehicle.image,
      renterName: renterName.trim(),
      renterEmail: renterEmail.trim(),
      notes: `${isBike ? 'Bike Rental' : 'Car Rental'}: ${vehicle.name} · ${rentalDays} day(s) · ${serviceLabel} · ${coverageLabel} · Pickup: ${pickupLocation.trim()} (${pickupTime}) · Return: ${effectiveReturnHub}${addonNames.length ? ` · Add-ons: ${addonNames.join(', ')}` : ''}`
    });
    setShowCheckout(true);
  };

  if (loading) {
    return (
      <div className="vb-loading">
        <Sparkles size={30} color="#a3704c" />
        <h2>Loading vehicle rental configuration...</h2>
        <p>Preparing fleet availability, pickup hubs, and instant pricing.</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="vb-empty">
        <h1>Vehicle model not found</h1>
        <p>We could not locate that rental vehicle in our fleet catalog. Please select an available car, SUV, or motorcycle.</p>
        <Link to="/vehicles" className="vb-back-btn">
          <ArrowLeft size={16} /> Back to Vehicles Fleet
        </Link>
      </div>
    );
  }

  return (
    <div className="vb-page">
      {/* Top Breadcrumb + Hero Header */}
      <section className="vb-hero">
        <div className="vb-container">
          <nav className="vb-breadcrumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/vehicles">Vehicles</Link>
              </li>
              <li>
                <Link
                  to={`/vehicles/${vehicle.id}`}
                  state={{ vehicle }}
                  aria-current="page"
                >
                  {vehicle.name}
                </Link>
              </li>
            </ol>
          </nav>

          <div className="vb-hero-grid">
            <div className="vb-media-card">
              <SmartImage
                src={vehicle.image}
                alt={`${vehicle.name} ${vehicle.type}`}
                sizes="(max-width: 900px) 100vw, 560px"
                priority
              />
              <span className="vb-hero-tag">{vehicle.tag}</span>
            </div>

            <div className="vb-hero-summary">
              <span className="vb-eyebrow">
                {vehicle.category} · {vehicle.type}
              </span>
              <h1>{vehicle.name}</h1>
              <p className="vb-hero-lead">
                Complete your {isBike ? 'motorcycle' : 'car'} rental reservation with instant voucher issuance, transparent daily pricing in {currency}, and verified roadside support.
              </p>

              <div className="vb-spec-pills">
                <span><Users size={15} aria-hidden="true" /> {vehicle.seats} {isBike ? 'Riders' : 'Seats'}</span>
                <span><Gauge size={15} aria-hidden="true" /> {vehicle.gear}</span>
                <span><Luggage size={15} aria-hidden="true" /> {vehicle.luggage} {isBike ? 'Panniers/Bags' : 'Bags'}</span>
                <span><MapPin size={15} aria-hidden="true" /> {vehicle.pickup}</span>
              </div>

              <div className="vb-safety-banner">
                <ShieldCheck size={17} aria-hidden="true" />
                <div>
                  <strong>Safety & Verification:</strong> {vehicle.safety}. {specs.licenseRequired}.
                </div>
              </div>

              <div className="vb-price-strip">
                <div>
                  <small>Daily Base Rate</small>
                  <strong>{formatPrice(vehicle.price)}</strong>
                  <span> / day</span>
                </div>
                <Link to="/vehicles" className="vb-change-link">
                  <ArrowLeft size={15} aria-hidden="true" /> Change vehicle
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Booking Configuration + Live Summary Sidebar */}
      <div className="vb-container vb-content-grid">
        <div className="vb-main-col">
          {/* Included Rental Standards */}
          <section className="vb-card" aria-labelledby="rental-inclusions-heading">
            <h2 id="rental-inclusions-heading" className="vb-section-title">
              <Fuel size={19} aria-hidden="true" /> Included Rental Policies & Fleet Standards
            </h2>
            <div className="vb-policy-grid">
              <div className="vb-policy-item">
                <small>Mileage Allowance</small>
                <strong>{specs.mileagePolicy}</strong>
              </div>
              <div className="vb-policy-item">
                <small>Fuel Policy</small>
                <strong>{specs.fuelPolicy}</strong>
              </div>
              <div className="vb-policy-item">
                <small>Age & License</small>
                <strong>{specs.minimumAge} · Valid License</strong>
              </div>
              <div className="vb-policy-item">
                <small>Security Deposit</small>
                <strong>{specs.depositPolicy}</strong>
              </div>
            </div>
            <ul className="vb-inclusions-list">
              {specs.includedFeatures.map((feat) => (
                <li key={feat}>
                  <Check size={15} aria-hidden="true" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Accessible Rental Configuration Form */}
          <section className="vb-card" aria-labelledby="rental-form-heading">
            <h2 id="rental-form-heading" className="vb-section-title">
              <Calendar size={19} aria-hidden="true" /> Configure Your {isBike ? 'Bike Rental' : 'Car Rental'}
            </h2>

            <div className="visually-hidden" aria-live="polite" role="status">
              {liveStatusMsg}
            </div>

            {confirmedReservation ? (
              <div className="vb-confirmed-box">
                <div className="vb-confirmed-icon">
                  <CheckCircle2 size={36} />
                </div>
                <h3>{isBike ? 'Bike Rental' : 'Car Rental'} Confirmed</h3>
                <p>
                  Reservation <strong>{confirmedReservation.display_id}</strong> for <strong>{confirmedReservation.package_title}</strong> is confirmed and saved to your account.
                </p>
                <div className="vb-confirmed-meta">
                  <div>
                    <span>Route</span>
                    <strong>{confirmedReservation.destination_name}</strong>
                  </div>
                  <div>
                    <span>Dates</span>
                    <strong>{confirmedReservation.start_date} to {confirmedReservation.end_date}</strong>
                  </div>
                  <div>
                    <span>Total Paid</span>
                    <strong>{formatPrice(confirmedReservation.total_amount)}</strong>
                  </div>
                </div>
                <div className="vb-confirmed-actions">
                  <button
                    type="button"
                    className="vb-btn-primary"
                    onClick={() => generateBookingPDF({
                      id: confirmedReservation.display_id,
                      title: confirmedReservation.package_title,
                      destination: confirmedReservation.destination_name,
                      startDate: confirmedReservation.start_date,
                      endDate: confirmedReservation.end_date,
                      guests: confirmedReservation.guests,
                      amount: confirmedReservation.total_amount,
                      transport: vehicle.name,
                      guestName: renterName || user?.name || 'Verified Traveler',
                      email: renterEmail || user?.email || 'traveler@travelsphere.com',
                      status: 'CONFIRMED'
                    })}
                  >
                    <FileDown size={16} /> Download PDF Voucher
                  </button>
                  <button
                    type="button"
                    className="vb-btn-secondary"
                    onClick={() => navigate('/user-dashboard', { state: { bookingFilter: 'car' } })}
                  >
                    View in Dashboard <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <form
                id="vehicle-rental-form"
                aria-labelledby="rental-form-heading"
                onSubmit={handleProceedToCheckout}
                noValidate
              >
                {/* 1. Renter Contact Details */}
                <fieldset className="vb-fieldset">
                  <legend>1. Primary {isBike ? 'Rider' : 'Driver'} Details</legend>
                  <div className="vb-form-row">
                    <div className="vb-field">
                      <label htmlFor="vb-renter-name">
                        Full Name <span className="vb-req" aria-hidden="true">*</span>
                      </label>
                      <span id="vb-name-hint" className="vb-hint">Matches your driver’s license or passport</span>
                      <input
                        ref={nameRef}
                        id="vb-renter-name"
                        name="renterName"
                        type="text"
                        autoComplete="name"
                        required
                        minLength={2}
                        value={renterName}
                        onChange={(e) => setRenterNameOverride(e.target.value)}
                        onBlur={() => markTouched('renterName')}
                        aria-invalid={showErrorFor('renterName') ? 'true' : 'false'}
                        aria-describedby={showErrorFor('renterName') ? 'vb-name-hint vb-name-err' : 'vb-name-hint'}
                        className={showErrorFor('renterName') ? 'vb-input-invalid' : ''}
                      />
                      {showErrorFor('renterName') && (
                        <div id="vb-name-err" className="vb-error-msg">
                          Error: {validationErrors.renterName}
                        </div>
                      )}
                    </div>

                    <div className="vb-field">
                      <label htmlFor="vb-renter-email">
                        Email Address <span className="vb-req" aria-hidden="true">*</span>
                      </label>
                      <span id="vb-email-hint" className="vb-hint">Format: you@example.com</span>
                      <input
                        ref={emailRef}
                        id="vb-renter-email"
                        name="renterEmail"
                        type="email"
                        autoComplete="email"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        required
                        value={renterEmail}
                        onChange={(e) => setRenterEmailOverride(e.target.value)}
                        onBlur={() => markTouched('renterEmail')}
                        aria-invalid={showErrorFor('renterEmail') ? 'true' : 'false'}
                        aria-describedby={showErrorFor('renterEmail') ? 'vb-email-hint vb-email-err' : 'vb-email-hint'}
                        className={showErrorFor('renterEmail') ? 'vb-input-invalid' : ''}
                      />
                      {showErrorFor('renterEmail') && (
                        <div id="vb-email-err" className="vb-error-msg">
                          Error: {validationErrors.renterEmail}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="vb-form-row">
                    <div className="vb-field">
                      <label htmlFor="vb-renter-phone">
                        Mobile Phone Number <span className="vb-req" aria-hidden="true">*</span>
                      </label>
                      <span id="vb-phone-hint" className="vb-hint">Used for pickup desk coordination</span>
                      <input
                        ref={phoneRef}
                        id="vb-renter-phone"
                        name="renterPhone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        required
                        value={renterPhone}
                        onChange={(e) => setRenterPhoneOverride(e.target.value)}
                        onBlur={() => markTouched('renterPhone')}
                        aria-invalid={showErrorFor('renterPhone') ? 'true' : 'false'}
                        aria-describedby={showErrorFor('renterPhone') ? 'vb-phone-hint vb-phone-err' : 'vb-phone-hint'}
                        className={showErrorFor('renterPhone') ? 'vb-input-invalid' : ''}
                      />
                      {showErrorFor('renterPhone') && (
                        <div id="vb-phone-err" className="vb-error-msg">
                          Error: {validationErrors.renterPhone}
                        </div>
                      )}
                    </div>

                    <div className="vb-field">
                      <label htmlFor="vb-travelers">
                        {isBike ? 'Riders' : 'Passengers / Guests'} (Max {vehicle.seats})
                      </label>
                      <span id="vb-pax-hint" className="vb-hint">Fits up to {vehicle.seats} {isBike ? 'riders' : 'occupants'} comfortably</span>
                      <select
                        id="vb-travelers"
                        name="travelers"
                        value={travelers}
                        onChange={(e) => setTravelersOverride(Number(e.target.value))}
                        aria-describedby="vb-pax-hint"
                      >
                        {Array.from({ length: Math.max(1, vehicle.seats) }, (_, idx) => idx + 1).map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? (isBike ? 'Rider' : 'Passenger') : (isBike ? 'Riders' : 'Passengers')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </fieldset>

                {/* 2. Pickup & Drop-off Schedule */}
                <fieldset className="vb-fieldset">
                  <legend>2. Pickup Location & Rental Dates</legend>

                  <div className="vb-form-row">
                    <div className="vb-field">
                      <label htmlFor="vb-pickup-location">
                        Pickup Hub or Address <span className="vb-req" aria-hidden="true">*</span>
                      </label>
                      <span id="vb-hub-hint" className="vb-hint">Choose a depot or type your hotel/airport terminal</span>
                      <input
                        ref={pickupHubRef}
                        id="vb-pickup-location"
                        name="pickupLocation"
                        type="text"
                        list="vb-hub-options"
                        required
                        value={pickupLocation}
                        onChange={(e) => setPickupLocationOverride(e.target.value)}
                        onBlur={() => markTouched('pickupLocation')}
                        aria-invalid={showErrorFor('pickupLocation') ? 'true' : 'false'}
                        aria-describedby={showErrorFor('pickupLocation') ? 'vb-hub-hint vb-hub-err' : 'vb-hub-hint'}
                        className={showErrorFor('pickupLocation') ? 'vb-input-invalid' : ''}
                      />
                      <datalist id="vb-hub-options">
                        {COMMON_RENTAL_HUBS.map((hub) => (
                          <option key={hub} value={hub} />
                        ))}
                      </datalist>
                      {showErrorFor('pickupLocation') && (
                        <div id="vb-hub-err" className="vb-error-msg">
                          Error: {validationErrors.pickupLocation}
                        </div>
                      )}
                    </div>

                    <div className="vb-field">
                      <label htmlFor="vb-pickup-time">Pickup Time</label>
                      <span id="vb-time-hint" className="vb-hint">Local desk handover window</span>
                      <select
                        id="vb-pickup-time"
                        name="pickupTime"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        aria-describedby="vb-time-hint"
                      >
                        {PICKUP_TIMES.map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="vb-form-row">
                    <div className="vb-field">
                      <label htmlFor="vb-pickup-date">
                        Pickup Date <span className="vb-req" aria-hidden="true">*</span>
                      </label>
                      <input
                        ref={pickupDateRef}
                        id="vb-pickup-date"
                        name="pickupDate"
                        type="date"
                        min={minToday}
                        required
                        value={pickupDate}
                        onChange={(e) => handlePickupDateChange(e.target.value)}
                        onBlur={() => markTouched('pickupDate')}
                        aria-invalid={showErrorFor('pickupDate') ? 'true' : 'false'}
                        aria-describedby={showErrorFor('pickupDate') ? 'vb-pdate-err' : undefined}
                        className={showErrorFor('pickupDate') ? 'vb-input-invalid' : ''}
                      />
                      {showErrorFor('pickupDate') && (
                        <div id="vb-pdate-err" className="vb-error-msg">
                          Error: {validationErrors.pickupDate}
                        </div>
                      )}
                    </div>

                    <div className="vb-field">
                      <label htmlFor="vb-return-date">
                        Return Date <span className="vb-req" aria-hidden="true">*</span>
                      </label>
                      <input
                        ref={returnDateRef}
                        id="vb-return-date"
                        name="returnDate"
                        type="date"
                        min={pickupDate || minToday}
                        required
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        onBlur={() => markTouched('returnDate')}
                        aria-invalid={showErrorFor('returnDate') ? 'true' : 'false'}
                        aria-describedby={showErrorFor('returnDate') ? 'vb-rdate-err' : undefined}
                        className={showErrorFor('returnDate') ? 'vb-input-invalid' : ''}
                      />
                      {showErrorFor('returnDate') && (
                        <div id="vb-rdate-err" className="vb-error-msg">
                          Error: {validationErrors.returnDate}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Return Location Option */}
                  <div className="vb-return-hub-toggle">
                    <span className="vb-sub-label">Drop-off Hub</span>
                    <div className="vb-radio-inline-group">
                      <div className="vb-radio-inline">
                        <input
                          type="radio"
                          id="vb-ret-same"
                          name="returnHubMode"
                          value="same"
                          checked={returnHubMode === 'same'}
                          onChange={() => setReturnHubMode('same')}
                        />
                        <label htmlFor="vb-ret-same">Return to same pickup hub (Free)</label>
                      </div>
                      <div className="vb-radio-inline">
                        <input
                          type="radio"
                          id="vb-ret-diff"
                          name="returnHubMode"
                          value="different"
                          checked={returnHubMode === 'different'}
                          onChange={() => setReturnHubMode('different')}
                        />
                        <label htmlFor="vb-ret-diff">One-way drop-off at another hub (+{formatPrice(35)})</label>
                      </div>
                    </div>

                    {returnHubMode === 'different' && (
                      <div className="vb-field" style={{ marginTop: '0.75rem' }}>
                        <label htmlFor="vb-custom-return-hub">Select or Enter Drop-off Hub</label>
                        <input
                          id="vb-custom-return-hub"
                          type="text"
                          list="vb-hub-options"
                          value={customReturnHub}
                          onChange={(e) => setCustomReturnHub(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </fieldset>

                {/* 3. Service / Drive Mode (Visible Radio Cards) */}
                <fieldset className="vb-fieldset">
                  <legend>3. Select {isBike ? 'Riding' : 'Driving'} Mode</legend>
                  <div className="vb-radio-cards">
                    <div className={`vb-radio-card ${serviceType === 'self-drive' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        id="vb-mode-self"
                        name="serviceType"
                        value="self-drive"
                        checked={serviceType === 'self-drive'}
                        onChange={(e) => setServiceType(e.target.value)}
                      />
                      <label htmlFor="vb-mode-self">
                        <strong>{isBike ? 'Self-Ride Adventure' : 'Self-Drive Rental'}</strong>
                        <span>Keys handed directly to you at the pickup counter.</span>
                        <em>Included</em>
                      </label>
                    </div>

                    <div className={`vb-radio-card ${serviceType === 'chauffeur' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        id="vb-mode-chauffeur"
                        name="serviceType"
                        value="chauffeur"
                        checked={serviceType === 'chauffeur'}
                        onChange={(e) => setServiceType(e.target.value)}
                      />
                      <label htmlFor="vb-mode-chauffeur">
                        <strong>{isBike ? 'Licensed Road Captain' : 'Private Chauffeur Driver'}</strong>
                        <span>{isBike ? 'Experienced touring lead bike escorting your route.' : 'Uniformed multilingual chauffeur for stress-free travel.'}</span>
                        <em>+{formatPrice(45)} / day</em>
                      </label>
                    </div>

                    <div className={`vb-radio-card ${serviceType === 'airport-vip' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        id="vb-mode-vip"
                        name="serviceType"
                        value="airport-vip"
                        checked={serviceType === 'airport-vip'}
                        onChange={(e) => setServiceType(e.target.value)}
                      />
                      <label htmlFor="vb-mode-vip">
                        <strong>Airport VIP Curbside</strong>
                        <span>Priority meet-and-greet right outside baggage claim.</span>
                        <em>+{formatPrice(25)} flat</em>
                      </label>
                    </div>
                  </div>
                </fieldset>

                {/* 4. Protection Plan */}
                <fieldset className="vb-fieldset">
                  <legend>4. Insurance & Protection Coverage</legend>
                  <div className="vb-radio-cards vb-two-col">
                    <div className={`vb-radio-card ${protectionPlan === 'standard' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        id="vb-cov-standard"
                        name="protectionPlan"
                        value="standard"
                        checked={protectionPlan === 'standard'}
                        onChange={(e) => setProtectionPlan(e.target.value)}
                      />
                      <label htmlFor="vb-cov-standard">
                        <strong>Standard Collision Waiver</strong>
                        <span>Statutory third-party liability & basic theft protection.</span>
                        <em>Included</em>
                      </label>
                    </div>

                    <div className={`vb-radio-card ${protectionPlan === 'full' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        id="vb-cov-full"
                        name="protectionPlan"
                        value="full"
                        checked={protectionPlan === 'full'}
                        onChange={(e) => setProtectionPlan(e.target.value)}
                      />
                      <label htmlFor="vb-cov-full">
                        <strong>Zero-Excess Full Shield</strong>
                        <span>0 deductible covering tires, glass, mirrors & Priority Tow.</span>
                        <em>+{formatPrice(18)} / day</em>
                      </label>
                    </div>
                  </div>
                </fieldset>

                {/* 5. Optional Rental Gear & Extras */}
                <fieldset className="vb-fieldset">
                  <legend>5. Optional {isBike ? 'Riding Gear & Panniers' : 'Cabin Extras & Safety Gear'}</legend>
                  <div className="vb-addons-list">
                    {addonOptions.map((addon) => (
                      <div key={addon.id} className="vb-addon-row">
                        <input
                          type="checkbox"
                          id={`vb-addon-${addon.id}`}
                          checked={selectedAddons.includes(addon.id)}
                          onChange={() => toggleAddon(addon.id)}
                        />
                        <label htmlFor={`vb-addon-${addon.id}`}>
                          <span className="vb-addon-text">
                            <strong>{addon.label}</strong>
                            <small>{addon.desc}</small>
                          </span>
                          <span className="vb-addon-price">+{formatPrice(addon.pricePerDay)} / day</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>

                {/* 6. Special Requests */}
                <div className="vb-field">
                  <label htmlFor="vb-special-notes">Special Delivery or Flight Arrival Notes (Optional)</label>
                  <span id="vb-notes-hint" className="vb-hint">e.g., Flight number, child booster age, or helmet size (S/M/L/XL)</span>
                  <textarea
                    id="vb-special-notes"
                    name="specialNotes"
                    rows={3}
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    aria-describedby="vb-notes-hint"
                    placeholder="Add delivery instructions or gear sizing..."
                  />
                </div>
              </form>
            )}
          </section>
        </div>

        {/* Sticky Live Pricing Sidebar */}
        <aside className="vb-sidebar" aria-label="Rental cost summary">
          <div className="vb-summary-card">
            <div className="vb-summary-head">
              <div>
                <small>{isBike ? 'Motorbike Rate' : 'Vehicle Rate'}</small>
                <div className="vb-summary-rate">
                  {formatPrice(vehicle.price)} <small>/ day</small>
                </div>
              </div>
              <span className="vb-duration-pill">
                {rentalDays} {rentalDays === 1 ? 'Day' : 'Days'}
              </span>
            </div>

            <div className="vb-summary-route">
              <div>
                <span>Pickup</span>
                <strong>{pickupLocation || vehicle.pickup}</strong>
                <small>{pickupDate} · {pickupTime}</small>
              </div>
              <div>
                <span>Return</span>
                <strong>{returnHubMode === 'different' ? (customReturnHub || 'Alternate Hub') : (pickupLocation || vehicle.pickup)}</strong>
                <small>{returnDate}</small>
              </div>
            </div>

            <div className="vb-bill-breakdown">
              <div className="vb-bill-row">
                <span>Base rental ({formatPrice(vehicle.price)} × {rentalDays}d)</span>
                <strong>{formatPrice(dailyBaseCost)}</strong>
              </div>
              {driveModeFee > 0 && (
                <div className="vb-bill-row">
                  <span>{serviceType === 'chauffeur' ? (isBike ? 'Road Captain' : 'Private Chauffeur') : 'Airport VIP Delivery'}</span>
                  <strong>+{formatPrice(driveModeFee)}</strong>
                </div>
              )}
              {coverageFee > 0 && (
                <div className="vb-bill-row">
                  <span>Zero-Excess Protection ({rentalDays}d)</span>
                  <strong>+{formatPrice(coverageFee)}</strong>
                </div>
              )}
              {oneWayFee > 0 && (
                <div className="vb-bill-row">
                  <span>One-way Hub Return Fee</span>
                  <strong>+{formatPrice(oneWayFee)}</strong>
                </div>
              )}
              {addonsCost > 0 && (
                <div className="vb-bill-row">
                  <span>Selected Add-ons ({rentalDays}d)</span>
                  <strong>+{formatPrice(addonsCost)}</strong>
                </div>
              )}
              <div className="vb-bill-row vb-included">
                <span>Unlimited Mileage & Local Taxes</span>
                <strong>Included</strong>
              </div>
              <div className="vb-bill-total">
                <span>Total Rental Price</span>
                <strong>{formatPrice(totalAmount)}</strong>
              </div>
            </div>

            {!confirmedReservation && (
              <button
                type="submit"
                form="vehicle-rental-form"
                className="vb-submit-btn"
              >
                Confirm & Pay {formatPrice(totalAmount)} <ArrowRight size={16} />
              </button>
            )}

            <p className="vb-secure-note">
              <ShieldCheck size={14} aria-hidden="true" />
              Instant confirmation, promo coupons (TRAVEL20 / EXPLORE50), and PDF voucher at checkout.
            </p>
          </div>
        </aside>
      </div>

      {/* Related Vehicles Shelf */}
      {relatedVehicles.length > 0 && (
        <section className="vb-container vb-related" aria-labelledby="related-vehicles-heading">
          <div className="vb-related-head">
            <div>
              <span className="vb-eyebrow">EXPLORE SIMILAR {vehicle.category.toUpperCase()}</span>
              <h2 id="related-vehicles-heading">Other Fleet Models You Might Prefer</h2>
            </div>
            <Link to="/vehicles" className="vb-change-link">View all fleet <ArrowRight size={15} /></Link>
          </div>
          <div className="vb-related-grid">
            {relatedVehicles.map((item) => (
              <article key={item.id} className="vb-related-card">
                <div className="vb-related-img">
                  <SmartImage src={item.image} alt={item.name} sizes="(max-width: 768px) 92vw, 360px" />
                </div>
                <div className="vb-related-body">
                  <small>{item.type}</small>
                  <h3>{item.name}</h3>
                  <div className="vb-related-foot">
                    <strong>{formatPrice(item.price)}<span>/day</span></strong>
                    <Link to={`/vehicles/${item.id}`} className="vb-related-cta">
                      {getRentalButtonLabel(item)} <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        bookingDetails={checkoutDetails}
        onSuccess={(confirmed) => {
          setShowCheckout(false);
          setConfirmedReservation(confirmed);
        }}
      />
    </div>
  );
}

export default function VehicleBookingPage() {
  const { id } = useParams();
  return <VehicleBookingInner key={id} id={id} />;
}
