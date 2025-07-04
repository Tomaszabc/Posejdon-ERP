describe('Logowanie', () => {
  it('poprawne logowanie użytkownika posejdon', () => {
    cy.visit('http://localhost:3000/login');
    cy.get('input[name="username"]').type('posejdon');
    cy.get('input[name="password"]').type('2580');
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://localhost:3000/');
    cy.contains('posejdon').should('be.visible');
  });

  it('niepoprawne logowanie', () => {
    cy.visit('http://localhost:3000/login');
    cy.get('input[name="username"]').type('niepoprawny');
    cy.get('input[name="password"]').type('zlehaslo');
    cy.get('button[type="submit"]').click();
    cy.contains('Nieprawidłowy login lub hasło.').should('be.visible');
  });
});
