export const createProblem = async (req, res) => {
  //going to get all the data from the request body
  //going to check for the user role once again
  //loop through each reference solution for different languageconst {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testCases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  // Step 1: Check if the requesting user is an admin
  if (req.user.role !== 'ADMIN') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Step 2: Loop through each reference solution for different languages
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      // Step 2.1: Get Judge0 language ID for the current language
      const languageId = getJudge0LanguageId(language);
      if (!languageId) {
        return res
          .status(400)
          .json({ error: `Unsupported language: ${language}` });
      }

      // Step 2.2: Prepare Judge0 submissions for all test cases
      const submissions = testCases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      console.log('Submissions:', submissions);

      // TODO: CONVERT SUBMISSION TO CHUNKS OF 20

      // Step 2.3: Submit all test cases in one batch
      const submissionResults = await submitBatch(submissions);

      // Step 2.4: Extract tokens from response
      const tokens = submissionResults.map((res) => res.token);

      // Step 2.5: Poll Judge0 until all submissions are done
      const results = await pollBatchResults(tokens);

      // Step 2.6: Validate that each test case passed (status.id === 3)
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status.id !== 3) {
          return res.status(400).json({
            error: `Validation failed for ${language} on input: ${submissions[i].stdin}`,
            details: result,
          });
        }
      }
    }

    // Step 3: Save the problem in the database after all validations pass
    const newProblem = await db.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testCases,
        codeSnippets,
        referenceSolutions,
        userId: req.user.id,
      },
    });

    // Step 4: Return success response with newly created problem
    res.status(201).json({
      success: true,
      message: 'Problem created successfully',
      problem: newProblem,
    });
  } catch (error) {
    console.error('Error creating problem:', error);
    res.status(500).json({ error: 'Failed to create problem' });
  
};

export const getAllProblems = async (req, res) => {};

export const getProblemById = async (req, res) => {};

export const updateProblem = async (req, res) => {};

export const deleteProblem = async (req, res) => {};

export const getAllProblemsSolvedByUser = async (req, res) => {};
