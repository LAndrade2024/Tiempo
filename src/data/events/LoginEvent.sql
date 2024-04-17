SELECT  [id]
       , [title]
       , [username]
       , [pwd]
FROM    [dbo].[usuarios]
WHERE   [username] = @username and [pwd]=@pwd
ORDER BY
       [id];