-- Add subscription fields to profiles table
ALTER TABLE profiles
ADD COLUMN is_subscribed BOOLEAN DEFAULT FALSE,
ADD COLUMN subscription_ends_at TIMESTAMP WITH TIME ZONE;

-- Add payment_status to trips table
ALTER TABLE trips
ADD COLUMN payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded'));

-- Note: The RLS policies for profiles and trips were already correctly set up in previous scripts (e.g., 005-fix-profile-rls.sql).
-- Adding new columns does not require re-creating these policies, as they already allow users to manage their own data.
-- The actual payment processing and updating these fields would be handled by your backend
-- interacting with a payment gateway (e.g., Stripe) and its webhooks.
