describe('Testing adminUserDetails', () => {
  test('Test Valid Auth User ID', () => {
    const authUserId = adminAuthRegister('jess@hotmail.com', '123456ab', 'Jess', 'Tran');
    const user = adminUserDetails(authUserId);
    expect(user).toStrictEqual({user: expect.any(String)});
  });
 
  test('Test Invalid Auth User ID', () => {
    const user = adminUserDetails('-234');
    expect(user).toStrictEqual({error: expect.any(String)});
    });
  })
