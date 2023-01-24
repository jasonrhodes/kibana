/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

export interface RelativeTimeResult {
  number: number;
  unit: 'seconds' | 'minutes' | 'hours' | 'days';
  past: boolean;
}

const oneSecond = 1000;
const oneMinute = oneSecond * 60;
const oneHour = oneMinute * 60;
const oneDay = oneHour * 24;

export function relativeTime(date: Date, now: Date = new Date()): RelativeTimeResult | Date {
  let past = true;
  let msDiff = now.getTime() - date.getTime();
  if (msDiff < 0) {
    past = false;
    msDiff = msDiff * -1;
  }

  if (msDiff < oneMinute) {
    return {
      number: Math.floor(msDiff / oneSecond),
      unit: 'seconds',
      past,
    };
  }

  if (msDiff < oneHour) {
    return {
      number: Math.floor(msDiff / oneMinute),
      unit: 'minutes',
      past,
    };
  }

  if (msDiff <= oneDay / 2) {
    return {
      number: Math.floor(msDiff / oneHour),
      unit: 'hours',
      past,
    };
  }

  return date;
}

export function relativeTimeString(date: Date, now: Date = new Date()) {
  const relative = relativeTime(date, now);

  if (relative instanceof Date) {
    return relative.toLocaleDateString();
  }

  if (relative.past) {
    return relative.number < 4
      ? `a few ${relative.unit} ago`
      : `${relative.number} ${relative.unit} ago`;
  }

  return `${relative.number} ${relative.unit} in the future`;
}
