import test from 'ava'
import R from 'ramda'
import reduxsauce from '../src/reduxsauce-crud'

const { createTypes } = reduxsauce;

test('responds with violence if not passed a string', (t) => {
  t.throws(() => createTypes())
})

test('creates an object with the right keys and values', (t) => {
  const types = createTypes('one')
  const keys = R.keys(types)
  const values = R.values(types)
  t.is(keys[0], 'one')
  t.is(values[0], 'ONE')
})

test('handles the prefix option', (t) => {
  const types = createTypes('one', {
    prefix: 'SUPER_'
  })
  const keys = R.keys(types)
  const values = R.values(types)
  t.is(keys[0], 'one')
  t.is(values[0], 'SUPER_ONE')
})

test('handles space delimited', (t) => {
  const types = createTypes('one two three')
  const keys = R.keys(types)
  const values = R.values(types)
  t.is(keys.length, 3)
  t.is(keys[2], 'three')
  t.is(values[2], 'THREE')
})

test('handles multiple space delimiters', (t) => {
  const types = createTypes('one two     three')
  const keys = R.keys(types)
  const values = R.values(types)
  t.is(keys.length, 3)
  t.is(keys[2], 'three')
  t.is(values[2], 'THREE')
})

test('handles multiple tab delimiters', (t) => {
  const types = createTypes('one two\t\t\t\tthree')
  const keys = R.keys(types)
  const values = R.values(types)
  t.is(keys.length, 3)
  t.is(keys[2], 'three')
  t.is(values[2], 'THREE')
})