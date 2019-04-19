import validate from './validate-schema';

describe('validation middleware', () => {
  const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['convId'],
    properties: {
      convId: {
        type: 'string',
      },
      reason: {
        type: 'string',
      },
    },
  };
  const res = jest.fn();

  it('should validate', () => {
    const next = jest.fn();
    const req = { body: { convId: 'id1' } };
    validate([schema])(req, res, next);
    expect(next).toBeCalled();
  });

  it('should return message when validation fails', () => {
    const next = jest.fn();
    const req = { body: { something: 'id1' } };
    validate([schema])(req, res, next);
    expect(next).toBeCalled();
  });
});
