Feature: Safeplace tests

  Background:
    * def config = read('config.json')
    * def basicUrl = config.basicUrl + config.port
    * def ExternServiceUrl = config.basicUrl + config.externServicePort
    * def adminPassword = config.adminPassword
    * def userPassword = config.userPassword

  Scenario: Try to get 10 safeplaces as a user
    # login user
    Given url basicUrl + '/login'
    And request { email: "test@test.fr", password: #(userPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """
    And def token = response.token

    #get safeplace list

    Given url ExternServiceUrl + '/safeplace?limit=10&offset=0'
    And header Authorization = 'Bearer ' + token
    When method get
    Then status 200

  Scenario: Try to get 10 safeplaces as an admin
    # login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password: #(adminPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """
    And def token = response.token

    #get safeplace list

    Given url ExternServiceUrl + '/safeplace?limit=10&offset=0'
    And header Authorization = 'Bearer ' + token
    When method get
    Then status 200
