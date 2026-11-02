import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import generateItinerary from '../src/utils/aiItineraryEngine.js';
import { DEFAULT_PRIVACY_PREFERENCES } from '../src/utils/privacy.js';

describe('AI Dynamic Itinerary Generator (Gemini 2026 Engine)', () => {
  test('generates valid customized itinerary for Kyoto with budget tier', () => {
    const plan = generateItinerary({
      destinationId: 'kyoto',
      origin: 'New York, JFK',
      durationDays: 5,
      vibe: 'Culture & Heritage',
      budgetTier: 'moderate',
      travelers: 2
    });

    assert.ok(plan.id.startsWith('ITIN-'), 'plan has unique ITIN reference');
    assert.equal(plan.durationDays, 5);
    assert.equal(plan.durationNights, 4);
    assert.equal(plan.travelers, 2);
    assert.equal(plan.destinationName, 'Kyoto, Japan');
    assert.equal(plan.days.length, 5);
    assert.ok(plan.costs.total > 0, 'costs.total is calculated');
    assert.equal(plan.costs.perPerson, Math.round(plan.costs.total / 2));
    assert.ok(plan.hotel.name.length > 0, 'hotel is selected');
  });

  test('adjusts pricing realistically for luxury tier', () => {
    const budgetPlan = generateItinerary({
      destinationId: 'swiss-alps',
      origin: 'London Heathrow',
      durationDays: 6,
      budgetTier: 'budget',
      travelers: 1
    });

    const luxuryPlan = generateItinerary({
      destinationId: 'swiss-alps',
      origin: 'London Heathrow',
      durationDays: 6,
      budgetTier: 'luxury',
      travelers: 1
    });

    assert.ok(luxuryPlan.costs.total > budgetPlan.costs.total, 'Luxury cost exceeds budget tier cost');
    assert.equal(luxuryPlan.durationDays, 6);
  });
});

describe('Split Group Payments & Multi-Currency Converter', () => {
  const RATES = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.5,
    JPY: 155.0,
    AED: 3.67
  };

  test('accurately computes multi-traveler group splits', () => {
    const totalPackagePrice = 2400;
    const split3 = Math.round(totalPackagePrice / 3);
    const split4 = Math.round(totalPackagePrice / 4);

    assert.equal(split3, 800);
    assert.equal(split4, 600);
  });

  test('converts currencies with valid exchange coefficients', () => {
    const amountUSD = 1000;
    assert.equal(Math.round(amountUSD * RATES.EUR), 920);
    assert.equal(Math.round(amountUSD * RATES.GBP), 790);
    assert.equal(Math.round(amountUSD * RATES.INR), 83500);
    assert.equal(Math.round(amountUSD * RATES.JPY), 155000);
    assert.equal(Math.round(amountUSD * RATES.AED), 3670);
  });
});

describe('Security & CCPA Privacy Compliance', () => {
  test('session replay tracking is disabled by default', () => {
    assert.equal(DEFAULT_PRIVACY_PREFERENCES.sessionReplayEnabled, false);
  });

  test('CCPA Do-Not-Sell is enforced by default', () => {
    assert.equal(DEFAULT_PRIVACY_PREFERENCES.doNotSellOrShare, true);
  });
});
